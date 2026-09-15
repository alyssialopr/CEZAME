import { Router } from 'express';
import { requireAuth, requireSuperadmin, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin, hasServiceRoleKey } from '../config/supabase.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Toutes les routes de ce fichier exigent d'être authentifié ET d'être superadmin
router.use(requireAuth, requireSuperadmin);

// Lister les administrateurs
router.get('/', async (_req: AuthenticatedRequest, res) => {
  try {
    const { data: roles, error } = await supabaseAdmin
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // Récupérer les emails via auth.admin si disponible
    const enriched = await Promise.all(
      (roles || []).map(async (r) => {
        let email = 'email_masque@cezame.app';
        let username = 'Admin';
        if (hasServiceRoleKey) {
          const { data: uData } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
          if (uData?.user) {
            email = uData.user.email || email;
            username = uData.user.user_metadata?.username || email.split('@')[0];
          }
        }
        return {
          userId: r.user_id,
          role: r.role,
          email,
          username,
          created_at: r.created_at,
        };
      })
    );

    res.json({ admins: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Créer un nouvel administrateur
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { email, password, role = 'admin', username } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis' });
      return;
    }

    if (role !== 'admin' && role !== 'superadmin') {
      res.status(400).json({ error: 'Rôle invalide (doit être admin ou superadmin)' });
      return;
    }

    if (!hasServiceRoleKey) {
      res.status(400).json({
        error: 'SUPABASE_SERVICE_ROLE_KEY requise dans server/.env pour créer un administrateur.',
      });
      return;
    }

    // 1. Créer le compte utilisateur Supabase
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username || email.split('@')[0],
      },
    });

    if (createError || !userData?.user) {
      res.status(400).json({ error: createError?.message || 'Erreur création du compte' });
      return;
    }

    const newUserId = userData.user.id;

    // 2. Insérer le rôle dans admin_roles
    const { error: roleError } = await supabaseAdmin.from('admin_roles').insert({
      user_id: newUserId,
      role,
    });

    if (roleError) {
      res.status(500).json({ error: roleError.message });
      return;
    }

    // Log d'audit
    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'CREATE_ADMIN',
      targetType: 'admin',
      targetId: newUserId,
      details: { email, role },
    });

    res.json({
      success: true,
      message: `Compte ${role} créé pour ${email}`,
      admin: {
        userId: newUserId,
        email,
        role,
        username,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour le rôle d'un administrateur
router.patch('/:userId', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = String(req.params.userId);
    const { role } = req.body;

    if (role !== 'admin' && role !== 'superadmin') {
      res.status(400).json({ error: 'Rôle invalide (doit être admin ou superadmin)' });
      return;
    }

    // Empêcher de rétrograder son propre compte superadmin
    if (userId === req.user?.id && role !== 'superadmin') {
      res.status(400).json({ error: 'Vous ne pouvez pas retirer vos propres droits de superadmin' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('admin_roles')
      .update({ role })
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'UPDATE_ADMIN_ROLE',
      targetType: 'admin',
      targetId: userId,
      details: { newRole: role },
    });

    res.json({ success: true, message: 'Rôle mis à jour' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Révoquer un compte administrateur
router.delete('/:userId', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = String(req.params.userId);

    if (userId === req.user?.id) {
      res.status(400).json({ error: 'Vous ne pouvez pas révoquer votre propre accès' });
      return;
    }

    const { error } = await supabaseAdmin.from('admin_roles').delete().eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'REVOKE_ADMIN',
      targetType: 'admin',
      targetId: userId,
    });

    res.json({ success: true, message: 'Droits administrateur révoqués' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
