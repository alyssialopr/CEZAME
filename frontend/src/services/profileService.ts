import { supabase } from '@/lib/supabase';

export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 30;

/**
 * Vérifie un pseudo saisi dans l'écran Profil.
 * Renvoie un message d'erreur à afficher, ou null si le pseudo est valide.
 */
export function validateUsername(raw: string): string | null {
  const name = raw.trim();
  if (!name) return 'Merci de renseigner un pseudo.';
  if (name.length < USERNAME_MIN_LENGTH) {
    return `Ton pseudo doit contenir au moins ${USERNAME_MIN_LENGTH} caractères.`;
  }
  if (name.length > USERNAME_MAX_LENGTH) {
    return `Ton pseudo ne peut pas dépasser ${USERNAME_MAX_LENGTH} caractères.`;
  }
  return null;
}

/**
 * Enregistre le nouveau pseudo :
 * - dans les métadonnées Supabase Auth (affichées par l'app via la session),
 * - dans la table public.users (lue par le backoffice).
 */
export async function updateUsername(
  userId: string,
  raw: string,
): Promise<{ success: true; username: string } | { success: false; error: string }> {
  const validationError = validateUsername(raw);
  if (validationError) return { success: false, error: validationError };

  const username = raw.trim();

  try {
    const { error: authError } = await supabase.auth.updateUser({ data: { username } });
    if (authError) {
      return { success: false, error: 'Impossible d’enregistrer ton pseudo. Réessaie dans un instant.' };
    }

    const { error: profileError } = await supabase
      .from('users')
      .update({ username })
      .eq('id', userId);
    if (profileError) {
      return { success: false, error: 'Impossible d’enregistrer ton pseudo. Réessaie dans un instant.' };
    }

    return { success: true, username };
  } catch {
    return { success: false, error: 'Connexion impossible. Vérifie ta connexion internet.' };
  }
}
