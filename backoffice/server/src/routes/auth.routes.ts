import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// Vérifier l'état de l'utilisateur connecté
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    user: req.user,
  });
});

// Vérifier si le système possède déjà au moins un superadmin
router.get('/system-status', async (_req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('admin_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'superadmin');

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({
      hasSuperadmin: (count || 0) > 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Initialiser le premier superadmin (seulement si aucun superadmin n'existe encore)
router.post('/bootstrap-superadmin', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis' });
      return;
    }

    // Vérifier si un superadmin existe déjà
    const { count } = await supabaseAdmin
      .from('admin_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'superadmin');

    if (count && count > 0) {
      res.status(400).json({ error: 'Un superadmin existe déjà dans le système' });
      return;
    }

    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username || 'Super Admin',
      },
    });

    if (createError || !newUser.user) {
      res.status(400).json({ error: createError?.message || 'Échec création utilisateur' });
      return;
    }

    // 2. Attribuer le rôle superadmin
    const { error: roleError } = await supabaseAdmin.from('admin_roles').insert({
      user_id: newUser.user.id,
      role: 'superadmin',
    });

    if (roleError) {
      res.status(500).json({ error: roleError.message });
      return;
    }

    res.json({
      success: true,
      message: 'Superadmin initialisé avec succès',
      userId: newUser.user.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
