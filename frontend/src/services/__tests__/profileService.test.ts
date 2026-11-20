import { updateUsername, validateUsername } from '@/services/profileService';
import { argsOf, callsTo, onQuery, supabase } from '../../../test/fakeSupabase';

describe('validateUsername', () => {
  it('refuse un pseudo vide, trop court ou trop long', () => {
    expect(validateUsername('   ')).toBe('Merci de renseigner un pseudo.');
    expect(validateUsername(' a ')).toMatch(/au moins 2 caractères/);
    expect(validateUsername('x'.repeat(31))).toMatch(/dépasser 30 caractères/);
  });

  it('accepte un pseudo valide', () => {
    expect(validateUsername('  Camille ')).toBeNull();
  });
});

describe('updateUsername', () => {
  it('enregistre le pseudo nettoyé dans Auth et dans public.users', async () => {
    const res = await updateUsername('u1', '  Camille ');

    expect(res).toEqual({ success: true, username: 'Camille' });
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ data: { username: 'Camille' } });
    const call = callsTo('users')[0];
    expect(argsOf(call, 'update')).toEqual([{ username: 'Camille' }]);
    expect(argsOf(call, 'eq')).toEqual(['id', 'u1']);
  });

  it("n'appelle pas le serveur si le pseudo est invalide", async () => {
    const res = await updateUsername('u1', '');

    expect(res).toEqual({ success: false, error: 'Merci de renseigner un pseudo.' });
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    expect(callsTo('users')).toHaveLength(0);
  });

  it("signale l'échec de l'enregistrement du profil", async () => {
    onQuery(() => ({ error: { message: 'denied' } }));

    const res = await updateUsername('u1', 'Camille');

    expect(res.success).toBe(false);
  });

  it("signale l'échec de la mise à jour Auth sans toucher à la table", async () => {
    supabase.auth.updateUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'boom' } } as any);

    const res = await updateUsername('u1', 'Camille');

    expect(res.success).toBe(false);
    expect(callsTo('users')).toHaveLength(0);
  });
});
