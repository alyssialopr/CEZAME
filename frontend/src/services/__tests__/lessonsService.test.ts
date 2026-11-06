import AsyncStorage from '@react-native-async-storage/async-storage';
import { LESSONS } from '@/constants/lessons';
import {
  completeLesson,
  fetchCategoryUnits,
  fetchLessonDetails,
  getLocalFallbackUnits,
  resolveQuestionType,
} from '@/services/lessonsService';
import { argsOf, callsTo, onQuery } from '../../../test/fakeSupabase';

describe('resolveQuestionType', () => {
  it('respecte un type explicite', () => {
    expect(resolveQuestionType('bucket', [])).toBe('bucket');
    expect(resolveQuestionType('scenario', null)).toBe('scenario');
  });

  it('reconnaît le type à la forme des options', () => {
    expect(resolveQuestionType(undefined, { context: 'x', options: [] })).toBe('scenario');
    expect(resolveQuestionType(undefined, { sender: 'Banque', isScam: true })).toBe('scam');
    expect(resolveQuestionType(undefined, { buckets: [], items: [] })).toBe('bucket');
    expect(resolveQuestionType(undefined, [{ id: '1', text: 'x', bucketId: 'b' }])).toBe('bucket');
    expect(resolveQuestionType(undefined, [{ id: 'f', label: 'Nom', value: 'X' }])).toBe('document');
    expect(resolveQuestionType(undefined, [{ id: '1', left: 'a', right: 'b' }])).toBe('matching');
    expect(resolveQuestionType(undefined, [{ id: '1', text: 'Étape' }])).toBe('order');
    expect(resolveQuestionType(undefined, [{ letter: 'A', text: 'Oui', correct: true }])).toBe('qcm');
    expect(resolveQuestionType('qcm', [{ id: '1', text: 'Étape' }])).toBe('order');
  });
});

describe('getLocalFallbackUnits', () => {
  it('débloque les leçons une à une', () => {
    const units = getLocalFallbackUnits('sante');
    const statuses = units.flatMap((u) => u.lessons.map((l) => l.status));
    expect(statuses).toEqual(['unlocked', 'locked', 'locked', 'locked']);
    expect(units.map((u) => u.lessons.length)).toEqual([3, 1]);
  });

  it('suit la progression enregistrée', () => {
    const units = getLocalFallbackUnits('sante', { sante_1: 'completed', sante_2: 'completed' });
    expect(units.flatMap((u) => u.lessons.map((l) => l.status))).toEqual(['completed', 'completed', 'unlocked', 'locked']);
  });
});

describe('fetchCategoryUnits', () => {
  const units = [
    { id: 'U1', category_id: 'finance', unit_number: 1, title: 'Unité 1', subtitle: null, order_index: 1 },
    { id: 'U2', category_id: 'finance', unit_number: 2, title: 'Unité 2', subtitle: null, order_index: 2 },
  ];
  const lessons = ['L1', 'L2', 'L3'].map((id, i) => ({
    id, unit_id: i < 2 ? 'U1' : 'U2', category_id: 'finance', order_index: i + 1, title: id, xp_reward: 50,
  }));

  it('calcule le statut séquentiel à partir de la progression Supabase', async () => {
    onQuery((c) => {
      if (c.table === 'units') return { data: units };
      if (c.table === 'lessons') return { data: lessons };
      if (c.table === 'user_lesson_progress') return { data: [{ lesson_id: 'L1', status: 'completed', score: 6 }] };
    });

    const result = await fetchCategoryUnits('finance', 'user-1');

    expect(result.map((u) => u.lessons.map((l) => [l.id, l.status, l.score]))).toEqual([
      [['L1', 'completed', 6], ['L2', 'unlocked', undefined]],
      [['L3', 'locked', undefined]],
    ]);
    expect(JSON.parse((await AsyncStorage.getItem('@cezame_progress_user-1_finance'))!)).toEqual({ L1: 'completed' });
    expect(await AsyncStorage.getItem('@cezame_units_finance')).not.toBeNull();
  });

  it('retombe sur le cache puis sur le contenu local si Supabase échoue', async () => {
    onQuery(() => ({ error: { message: 'offline' } }));
    const local = await fetchCategoryUnits('voiture');
    expect(local[0].lessons[0].id).toBe('voiture_1');

    await AsyncStorage.setItem('@cezame_units_voiture', JSON.stringify([{ id: 'cached', lessons: [] }]));
    expect(await fetchCategoryUnits('voiture')).toEqual([{ id: 'cached', lessons: [] }]);
  });
});

describe('fetchLessonDetails', () => {
  it('lit la leçon dans Supabase et détecte le type des questions', async () => {
    onQuery((c) => {
      if (c.table === 'lessons') return { data: { id: 'L1', unit_id: 'U1', category_id: 'sante', order_index: 1, title: 'Ameli', xp_reward: 50 } };
      if (c.table === 'lesson_screens') return { data: [{ id: 's1', lesson_id: 'L1', order_index: 1, title: 'Fiche', body: 'B', tip: null }] };
      if (c.table === 'lesson_questions') {
        return { data: [{ id: 'q1', lesson_id: 'L1', order_index: 1, type: 'qcm', category: 'Q', prompt: 'P', explanation: 'E', options: '{"isScam":true,"sender":"x"}' }] };
      }
    });

    const details = await fetchLessonDetails('L1');

    expect(details?.title).toBe('Ameli');
    expect(details?.questions[0]).toMatchObject({ type: 'scam', options: { isScam: true, sender: 'x' } });
  });

  it('utilise le contenu local hors ligne, en déduisant la catégorie de l’identifiant', async () => {
    onQuery(() => ({ error: { message: 'offline' } }));
    const details = await fetchLessonDetails('logement_2');
    expect(details?.category_id).toBe('logement');
    expect(details?.questions).toHaveLength(LESSONS.logement.questions.length);
  });
});

describe('completeLesson', () => {
  it('enregistre la réussite en local et dans Supabase', async () => {
    await completeLesson('user-1', 'L2', 'finance', 7);

    expect(JSON.parse((await AsyncStorage.getItem('@cezame_progress_user-1_finance'))!)).toEqual({ L2: 'completed' });
    const [row, opts] = argsOf(callsTo('user_lesson_progress')[0], 'upsert')!;
    expect(row).toMatchObject({ user_id: 'user-1', lesson_id: 'L2', status: 'completed', score: 7 });
    expect(opts).toEqual({ onConflict: 'user_id,lesson_id' });
  });
});
