import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, getUserClient, hasServiceRoleKey } from '../config/supabase.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  username?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Jeton d’authentification manquant' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Vérification de l'utilisateur avec Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData?.user) {
      console.warn('Erreur validation session utilisateur:', userError?.message);
      res.status(401).json({ error: 'Session invalide ou expirée. Veuillez vous reconnecter.' });
      return;
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email || '';

    // Sélection du client Supabase :
    // Si la service_role_key est présente, on l'utilise pour bypasser les RLS.
    // Sinon, on utilise le client avec le token utilisateur.
    const client = hasServiceRoleKey ? supabaseAdmin : getUserClient(token);

    // Vérification du rôle dans public.admin_roles
    const { data: roleData, error: roleError } = await client
      .from('admin_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleError) {
      console.error('Erreur rôle Supabase détaillée:', roleError);

      let hint = '';
      if (roleError.code === '42P01') {
        hint =
          ' : La table "admin_roles" n’existe pas dans Supabase. Veuillez appliquer la migration SQL "20260914_backoffice_schema.sql" dans l’éditeur SQL de Supabase.';
      } else if (roleError.code === 'PGRST301' || roleError.message?.includes('JWT')) {
        hint = ' : Erreur d’authentification JWT avec Supabase.';
      } else if (!hasServiceRoleKey) {
        hint =
          ' : Assurez-vous d’avoir renseigné la clé SUPABASE_SERVICE_ROLE_KEY dans backoffice/server/.env ou que la policy RLS sur "admin_roles" autorise la lecture.';
      }

      res.status(500).json({
        error: `Erreur lors de la vérification des permissions (${roleError.message || roleError.code})${hint}`,
      });
      return;
    }

    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'superadmin')) {
      res.status(403).json({
        error:
          'Accès refusé : votre compte n’est pas enregistré comme administrateur dans la table "admin_roles".',
      });
      return;
    }

    req.user = {
      id: userId,
      email: userEmail,
      role: roleData.role as 'admin' | 'superadmin',
      username: (userData.user.user_metadata?.username as string) || userEmail.split('@')[0],
    };

    next();
  } catch (error: any) {
    console.error('Erreur middleware requireAuth inattendue:', error);
    res.status(500).json({ error: 'Erreur interne de vérification des droits : ' + (error.message || error) });
  }
}

export function requireSuperadmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'superadmin') {
    res.status(403).json({ error: 'Action réservée aux super-administrateurs' });
    return;
  }
  next();
}
