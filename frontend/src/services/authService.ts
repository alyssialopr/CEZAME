import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { tracker } from '@/services/trackerService';

const LAST_TESTER_NAME_KEY = '@cezame_last_tester_name';

/**
 * Partie locale de l'email de test : minuscules, sans accents, 20 caractères au plus.
 */
export function sanitizeTesterName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 20);
}

/**
 * Service de gestion des connexions testeurs (Phase de test / MVP).
 * Permet à un utilisateur de rentrer uniquement son nom ou prénom pour tester l'application directement.
 */
export async function signInAsTester(name: string): Promise<{ success: boolean; error?: string }> {
  const cleanName = name.trim();
  if (!cleanName) {
    return { success: false, error: 'Veuillez saisir votre nom ou prénom' };
  }

  // Mémoriser le nom pour faciliter les reconnexions futures sur cet appareil
  try {
    await AsyncStorage.setItem(LAST_TESTER_NAME_KEY, cleanName);
  } catch {}

  // Formatage de l'identifiant email de test
  const sanitized = sanitizeTesterName(cleanName);

  const testId = Math.random().toString(36).substring(2, 7);
  const testEmail = `test_${sanitized || 'user'}_${testId}@cezame-test.app`;
  const testPassword = `Testeur_${Date.now()}!`;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: cleanName,
          is_test_user: true,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.session || !data.user) {
      return { success: false, error: "Impossible de créer la session de test" };
    }

    // Initialiser le profil utilisateur dans la table public.users
    await supabase.from('users').upsert({
      id: data.user.id,
      username: cleanName,
      is_onboarding_completed: false,
    });

    // Enregistrer l'événement de démarrage de test dans le journal d'activité
    await tracker.track('test_session_started', {
      eventType: 'auth',
      properties: {
        tester_name: cleanName,
        is_test_account: true,
      },
      userId: data.user.id,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Une erreur inattendue est survenue' };
  }
}

/**
 * Récupère le dernier nom de testeur utilisé sur cet appareil
 */
export async function getLastTesterName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_TESTER_NAME_KEY);
  } catch {
    return null;
  }
}
