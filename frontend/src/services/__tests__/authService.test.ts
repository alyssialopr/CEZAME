import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLastTesterName, sanitizeTesterName, signInAsTester } from '@/services/authService';
import { argsOf, callsTo, supabase } from '../../../test/fakeSupabase';

describe('sanitizeTesterName', () => {
  it('retire accents, espaces et caractères spéciaux', () => {
    expect(sanitizeTesterName('Éloïse Müller')).toBe('eloise_muller');
    expect(sanitizeTesterName("Jean-François O'Neil")).toBe('jean_francois_o_neil');
  });

  it('coupe à 20 caractères', () => {
    expect(sanitizeTesterName('Maximilien-Alexandre de la Tour')).toHaveLength(20);
  });
});

describe('signInAsTester', () => {
  it('refuse un prénom vide sans appel réseau', async () => {
    const res = await signInAsTester('   ');
    expect(res).toEqual({ success: false, error: 'Veuillez saisir votre nom ou prénom' });
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('crée un compte de test, le profil et l’événement de démarrage', async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { session: { access_token: 't' }, user: { id: 'u1' } }, error: null });

    const res = await signInAsTester('  Camille ');

    expect(res).toEqual({ success: true });
    const arg = supabase.auth.signUp.mock.calls[0][0];
    expect(arg.email).toMatch(/^test_camille_[a-z0-9]{1,5}@cezame-test\.app$/);
    expect(arg.password).toMatch(/^Testeur_\d+!$/);
    expect(arg.options.data).toEqual({ username: 'Camille', is_test_user: true });

    expect(argsOf(callsTo('users')[0], 'upsert')?.[0]).toEqual({ id: 'u1', username: 'Camille', is_onboarding_completed: false });
    expect(argsOf(callsTo('user_events')[0], 'insert')?.[0]).toMatchObject({
      user_id: 'u1', event_type: 'auth', event_name: 'test_session_started',
    });
    expect(await getLastTesterName()).toBe('Camille');
  });

  it("signale l'erreur de Supabase", async () => {
    supabase.auth.signUp.mockResolvedValue({ data: {}, error: { message: 'Signups not allowed' } });
    expect(await signInAsTester('Lucas')).toEqual({ success: false, error: 'Signups not allowed' });
  });

  it("échoue si la confirmation par email empêche d'ouvrir une session", async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { session: null, user: { id: 'u2' } }, error: null });
    const res = await signInAsTester('Sarah');
    expect(res.success).toBe(false);
    expect(callsTo('users')).toHaveLength(0);
  });
});

describe('getLastTesterName', () => {
  it('renvoie null sans connexion précédente', async () => {
    expect(await getLastTesterName()).toBeNull();
    await AsyncStorage.setItem('@cezame_last_tester_name', 'Zoé');
    expect(await getLastTesterName()).toBe('Zoé');
  });
});
