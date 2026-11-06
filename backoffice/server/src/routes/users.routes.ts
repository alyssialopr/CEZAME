import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin, hasServiceRoleKey } from '../config/supabase.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Liste des utilisateurs
router.get('/', requireAuth, async (_req: AuthenticatedRequest, res) => {
  try {
    if (!hasServiceRoleKey) {
      // Si la clé de service n'est pas encore fournie, on récupère les utilisateurs ayant une progression
      const { data: progressUsers, error: pError } = await supabaseAdmin
        .from('user_lesson_progress')
        .select('user_id');

      if (pError) {
        res.status(500).json({ error: pError.message });
        return;
      }

      const uniqueIds = Array.from(new Set((progressUsers || []).map((p) => p.user_id)));
      const fallbackList = uniqueIds.map((id) => ({
        id,
        email: `utilisateur-${id.substring(0, 8)}@cezame.app`,
        created_at: new Date().toISOString(),
        user_metadata: { username: `Apprenant_${id.substring(0, 4)}` },
        isFallback: true,
      }));

      res.json({
        users: fallbackList,
        warning: 'SUPABASE_SERVICE_ROLE_KEY manquante dans server/.env. Les comptes affichés proviennent des historiques de cours.',
      });
      return;
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // Récupérer les rôles pour marquer les éventuels admins dans la liste
    const { data: adminRoles } = await supabaseAdmin.from('admin_roles').select('user_id, role');
    const roleMap = new Map((adminRoles || []).map((r) => [r.user_id, r.role]));

    const enrichedUsers = await Promise.all(
      (data.users || []).map(async (u) => {
        const { count: completedCount } = await supabaseAdmin
          .from('user_lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', u.id)
          .eq('status', 'completed');

        const isTester = Boolean(
          u.user_metadata?.is_test_user ||
          u.email?.includes('cezame-test.app') ||
          u.email?.includes('test.cezame.app')
        );

        return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          username: u.user_metadata?.username || u.email?.split('@')[0],
          role: roleMap.get(u.id) || (isTester ? 'tester' : 'user'),
          isTester,
          completedLessonsCount: completedCount || 0,
        };
      })
    );

    res.json({ users: enrichedUsers });
  } catch (err: any) {
    console.error('Erreur listing users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Détails et progression d'un utilisateur spécifique
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);

    const { data: progressList, error: pError } = await supabaseAdmin
      .from('user_lesson_progress')
      .select('lesson_id, status, score, completed_at, lessons(title, category_id, xp_reward)')
      .eq('user_id', id);

    if (pError) {
      res.status(500).json({ error: pError.message });
      return;
    }

    let userInfo: any = { id };
    if (hasServiceRoleKey) {
      const { data: uData } = await supabaseAdmin.auth.admin.getUserById(id);
      if (uData?.user) {
        userInfo = {
          id: uData.user.id,
          email: uData.user.email,
          created_at: uData.user.created_at,
          username: uData.user.user_metadata?.username,
        };
      }
    }

    res.json({
      user: userInfo,
      progress: progressList || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un utilisateur
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);

    if (!hasServiceRoleKey) {
      res.status(400).json({
        error:
          'SUPABASE_SERVICE_ROLE_KEY manquante dans le fichier backoffice/server/.env pour exécuter la suppression de compte auth.',
      });
      return;
    }

    // Récupérer les infos de l'utilisateur pour le log
    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(id);
    const targetEmail = targetUser?.user?.email || id;

    // Suppression du compte dans Supabase Auth
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (delError) {
      res.status(500).json({ error: delError.message });
      return;
    }

    // Log d'audit
    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'DELETE_USER',
      targetType: 'user',
      targetId: id,
      details: { targetEmail },
    });

    res.json({ success: true, message: `Utilisateur ${targetEmail} supprimé avec succès.` });
  } catch (err: any) {
    console.error('Erreur suppression user:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
