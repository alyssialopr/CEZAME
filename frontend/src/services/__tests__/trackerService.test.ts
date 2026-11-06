import { tracker } from '@/services/trackerService';
import { argsOf, callsTo } from '../../../test/fakeSupabase';

const lastEvent = () => argsOf(callsTo('user_events').at(-1), 'insert')?.[0];

describe('tracker', () => {
  it('traite un objet simple comme des propriétés', async () => {
    await tracker.track('bouton_aide', { source: 'menu' });
    expect(lastEvent()).toMatchObject({
      event_name: 'bouton_aide',
      event_type: 'action',
      session_id: tracker.getSessionId(),
      properties: expect.objectContaining({ source: 'menu', platform: 'ios' }),
    });
  });

  it('lit les options quand elles sont fournies', async () => {
    await tracker.track('connexion', { eventType: 'auth', userId: 'u9', properties: { via: 'email' } });
    expect(lastEvent()).toMatchObject({ user_id: 'u9', event_type: 'auth', properties: expect.objectContaining({ via: 'email' }) });
    expect(lastEvent().properties).not.toHaveProperty('eventType');
  });

  it("retient l'écran courant pour les événements suivants", async () => {
    await tracker.trackScreen('lesson');
    await tracker.trackClick('verifier');
    expect(lastEvent()).toMatchObject({ event_type: 'click', event_name: 'verifier', screen_name: 'lesson' });
  });

  it('change de session à la demande', () => {
    const before = tracker.getSessionId();
    expect(tracker.resetSession()).not.toBe(before);
  });
});
