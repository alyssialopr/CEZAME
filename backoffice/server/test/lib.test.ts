import { describe, it, expect } from 'vitest';
import {
  buildLessonExport,
  exportFilename,
  mapImportedQuestions,
  mapImportedScreens,
  readLessonFields,
  unwrapLessonPayload,
} from '../src/lib/lessonTransfer.js';
import { buildFallbackUsers, isTesterUser, resolveUserRole } from '../src/lib/users.js';
import { activityPagination, auditPagination } from '../src/lib/pagination.js';
import { aggregateActivity } from '../src/lib/activityStats.js';

describe('lessonTransfer', () => {
  it("construit l'export au format 1.0", () => {
    const now = new Date('2026-11-06T10:00:00Z');
    const out = buildLessonExport({ title: 'Ma leçon', category_id: 'sante', xp_reward: 70 }, null, null, now);
    expect(out).toEqual({
      version: '1.0',
      exportedAt: '2026-11-06T10:00:00.000Z',
      lesson: { title: 'Ma leçon', category_id: 'sante', xp_reward: 70, screens: [], questions: [] },
    });
  });

  it('remplace les espaces du titre dans le nom de fichier', () => {
    expect(exportFilename('La  carte vitale')).toBe('lesson-La_carte_vitale.json');
  });

  it('accepte le format serveur et le format à plat', () => {
    expect(unwrapLessonPayload({ version: '1.0', lesson: { title: 'A' } })).toEqual({ title: 'A' });
    expect(unwrapLessonPayload({ title: 'B' })).toEqual({ title: 'B' });
    expect(unwrapLessonPayload(undefined)).toBeUndefined();
  });

  it('applique les valeurs par défaut de la leçon', () => {
    expect(readLessonFields({})).toEqual({ title: 'Nouvelle Leçon Importée', xpReward: 50, screens: [], questions: [] });
    expect(readLessonFields({ title: 'T', xp_reward: '120' }).xpReward).toBe(120);
    expect(readLessonFields({ xp_reward: 'abc' }).xpReward).toBe(50);
  });

  it('numérote et complète les fiches', () => {
    expect(mapImportedScreens([{ body: 'texte' }, { title: 'X', order_index: 7, tip: 'astuce' }], 'L1')).toEqual([
      { lesson_id: 'L1', order_index: 1, title: 'Fiche 1', body: 'texte', tip: null },
      { lesson_id: 'L1', order_index: 7, title: 'X', body: '', tip: 'astuce' },
    ]);
  });

  it('conserve le type et les options objet des questions', () => {
    const bucket = { buckets: [{ id: 'b1', label: 'Oui' }], items: [{ id: 'i1', text: 'x', bucketId: 'b1' }] };
    const scam = { sender: 'Banque', channel: 'sms', message: 'Cliquez', isScam: true, redFlags: ['lien'] };
    const [q1, q2, q3] = mapImportedQuestions(
      [{ type: 'bucket', options: bucket }, { type: 'scam', options: scam, prompt: 'Arnaque ?' }, {}],
      'L1'
    );
    expect(q1).toMatchObject({ type: 'bucket', options: bucket, order_index: 1 });
    expect(q2).toMatchObject({ type: 'scam', options: scam, prompt: 'Arnaque ?' });
    expect(q3).toEqual({
      lesson_id: 'L1', order_index: 3, type: 'qcm', category: 'Quiz', prompt: 'Question', options: [], explanation: '',
    });
  });
});

describe('users', () => {
  it('reconnaît un testeur par métadonnée ou domaine', () => {
    expect(isTesterUser({ email: 'a@b.fr', user_metadata: { is_test_user: true } })).toBe(true);
    expect(isTesterUser({ email: 'test_camille_ab12c@cezame-test.app' })).toBe(true);
    expect(isTesterUser({ email: 'x@test.cezame.app' })).toBe(true);
    expect(isTesterUser({ email: 'vrai@gmail.com', user_metadata: {} })).toBe(false);
    expect(isTesterUser({})).toBe(false);
  });

  it('donne la priorité au rôle admin', () => {
    expect(resolveUserRole('superadmin', true)).toBe('superadmin');
    expect(resolveUserRole(undefined, true)).toBe('tester');
    expect(resolveUserRole(undefined, false)).toBe('user');
  });

  it('déduplique les utilisateurs de repli', () => {
    const list = buildFallbackUsers(['abcdef123456', 'abcdef123456', 'zzzz9999'], new Date('2026-01-01T00:00:00Z'));
    expect(list).toHaveLength(2);
    expect(list[0]).toEqual({
      id: 'abcdef123456',
      email: 'utilisateur-abcdef12@cezame.app',
      created_at: '2026-01-01T00:00:00.000Z',
      user_metadata: { username: 'Apprenant_abcd' },
      isFallback: true,
    });
  });
});

describe('pagination', () => {
  it("borne la limite d'activité entre 10 et 100", () => {
    expect(activityPagination(undefined, undefined)).toEqual({ page: 1, limit: 30, offset: 0 });
    expect(activityPagination('3', '5')).toEqual({ page: 3, limit: 10, offset: 20 });
    expect(activityPagination('0', '500')).toEqual({ page: 1, limit: 100, offset: 0 });
  });

  it("calcule la plage des logs d'audit", () => {
    expect(auditPagination(undefined, undefined)).toEqual({ page: 1, limit: 30, from: 0, to: 29 });
    expect(auditPagination('2', '10')).toEqual({ page: 2, limit: 10, from: 10, to: 19 });
    expect(auditPagination('abc', 'x')).toEqual({ page: 1, limit: 30, from: 0, to: 29 });
  });
});

describe('aggregateActivity', () => {
  it('classe écrans, événements et types, et compte les actifs du jour', () => {
    const today = '2026-11-06T00:00:00.000Z';
    const events = [
      { event_type: 'screen_view', screen_name: 'login', event_name: 'view', user_id: 'u1', created_at: '2026-11-06T08:00:00Z' },
      { event_type: 'screen_view', screen_name: 'login', event_name: 'view', user_id: 'u2', created_at: '2026-11-06T09:00:00Z' },
      { event_type: 'click', screen_name: 'lesson', event_name: 'tap', user_id: 'u1', created_at: '2026-11-06T09:30:00Z' },
      { event_type: 'click', screen_name: null, event_name: 'tap', user_id: 'u3', created_at: '2026-11-05T09:30:00Z' },
    ];
    const r = aggregateActivity(events, today);
    expect(r.activeUsersToday).toBe(2);
    expect(r.topScreens).toEqual([{ screen: 'login', count: 2 }, { screen: 'lesson', count: 1 }]);
    expect(r.totalUsers).toBe(3);
    expect(r.topEvents).toEqual(expect.arrayContaining([{ event: 'view', count: 2 }, { event: 'tap', count: 2 }]));
    expect(r.eventsByType).toEqual(
      expect.arrayContaining([{ type: 'screen_view', count: 2 }, { type: 'click', count: 2 }])
    );
  });

  // Les événements arrivent du plus récent au plus ancien (order desc côté route).
  const ev = (event_name: string, user_id: string, created_at: string, properties: Record<string, any> = {}) => ({
    event_type: 'lesson',
    event_name,
    user_id,
    created_at,
    properties,
  });

  it("calcule l'entonnoir leçon → quiz → complétion et la durée moyenne", () => {
    const events = [
      ev('lesson_completed', 'u1', '2026-11-06T10:05:00Z', { durationSeconds: 300 }),
      ev('quiz_started', 'u1', '2026-11-06T10:02:00Z'),
      ev('lesson_abandoned', 'u2', '2026-11-06T09:03:00Z', { stage: 'quiz' }),
      ev('quiz_started', 'u2', '2026-11-06T09:02:00Z'),
      ev('lesson_abandoned', 'u3', '2026-11-06T08:01:00Z'),
      ev('lesson_opened', 'u3', '2026-11-06T08:00:00Z', { categoryId: 'sante' }),
      ev('lesson_opened', 'u2', '2026-11-06T09:00:00Z', { categoryId: 'finance' }),
      ev('lesson_opened', 'u1', '2026-11-06T10:00:00Z', { categoryId: 'finance' }),
    ];
    const r = aggregateActivity(events, '2026-11-06T00:00:00.000Z');
    expect(r.funnel).toMatchObject({
      opened: 3,
      quizStarted: 2,
      completed: 1,
      abandonedTheory: 1,
      abandonedQuiz: 1,
      transitionToQuizRate: 67,
      completionRate: 33,
    });
    expect(r.engagement.avgLessonMinutes).toBe(5);
    expect(r.engagement.avgLessonsPerUser).toBe(0.3);
    expect(r.categoryStats[0]).toMatchObject({ id: 'finance', label: 'Finance', count: 2, percentage: 67 });
    expect(r.firstPickStats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'finance', count: 2 }),
        expect.objectContaining({ id: 'sante', count: 1 }),
      ])
    );
  });

  it('mesure la réussite par type et classe les questions les plus ratées', () => {
    const events = [
      ev('question_answered', 'u1', 't', { exerciseType: 'scam', isCorrect: false, prompt: 'Arnaque ?' }),
      ev('question_answered', 'u2', 't', { exerciseType: 'scam', isCorrect: false, prompt: 'Arnaque ?' }),
      ev('question_answered', 'u3', 't', { exerciseType: 'scam', isCorrect: true, prompt: 'Arnaque ?' }),
      ev('question_answered', 'u1', 't', { isCorrect: true }),
      ev('onboarding_started', 'u1', 't'),
      ev('onboarding_started', 'u2', 't'),
      ev('onboarding_completed', 'u1', 't'),
    ];
    const r = aggregateActivity(events, 'z');
    expect(r.exerciseTypeSuccess).toEqual([
      { type: 'scam', total: 3, correct: 1, rate: 33 },
      { type: 'qcm', total: 1, correct: 1, rate: 100 },
    ]);
    expect(r.mostFailedQuestions[0]).toMatchObject({ prompt: 'Arnaque ?', failedCount: 2 });
    expect(r.engagement).toMatchObject({ onboardingStarted: 2, onboardingCompleted: 1, onboardingRate: 50 });
  });

  it('renvoie des valeurs neutres sans événement', () => {
    const r = aggregateActivity([], 'z');
    expect(r.funnel.completionRate).toBe(0);
    expect(r.engagement).toMatchObject({ avgLessonMinutes: 2.5, onboardingRate: 100 });
    expect(r.mostFailedQuestions).toEqual([]);
  });

  it('limite les tops à 5 écrans et 6 événements', () => {
    const events = Array.from({ length: 10 }, (_, i) => ({ screen_name: `s${i}`, event_name: `e${i}`, created_at: '' }));
    const r = aggregateActivity(events, 'z');
    expect(r.topScreens).toHaveLength(5);
    expect(r.topEvents).toHaveLength(6);
    expect(r.activeUsersToday).toBe(0);
  });
});
