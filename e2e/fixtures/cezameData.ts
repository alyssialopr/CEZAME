import type { SupabaseMock } from './supabaseMock';

// Une catégorie « finance » avec une unité et deux leçons courtes (1 fiche, 2 QCM).
export const LESSON_ID = 'lesson-budget-1';

export function seedFinanceContent(db: SupabaseMock) {
  db.seed('units', [
    { id: 'unit-finance-1', category_id: 'finance', unit_number: 1, title: 'Unité 1', subtitle: 'Les bases', order_index: 1 },
  ]);
  db.seed('lessons', [
    { id: LESSON_ID, unit_id: 'unit-finance-1', category_id: 'finance', order_index: 1, title: 'Faire son budget', xp_reward: 50, status: 'published' },
    { id: 'lesson-budget-2', unit_id: 'unit-finance-1', category_id: 'finance', order_index: 2, title: 'Épargner', xp_reward: 50, status: 'published' },
  ]);
  db.seed('lesson_screens', [
    { id: 'screen-1', lesson_id: LESSON_ID, order_index: 1, title: 'La règle 50/30/20', body: 'Besoins, envies, épargne.', tip: 'Commence petit.' },
  ]);
  db.seed('lesson_questions', [
    {
      id: 'q-1', lesson_id: LESSON_ID, order_index: 1, type: 'qcm', category: 'Budget',
      prompt: 'Quelle part pour les besoins ?', explanation: '50 % pour les besoins.',
      options: [
        { letter: 'A', text: '50 %', correct: true },
        { letter: 'B', text: '10 %', correct: false },
      ],
    },
    {
      id: 'q-2', lesson_id: LESSON_ID, order_index: 2, type: 'qcm', category: 'Budget',
      prompt: "Où mettre l'épargne de précaution ?", explanation: 'Un livret disponible à tout moment.',
      options: [
        { letter: 'A', text: 'Sous le matelas', correct: false },
        { letter: 'B', text: 'Sur un Livret A', correct: true },
      ],
    },
  ]);
}

export function seedOnboardedUser(db: SupabaseMock) {
  const user = { id: 'user-camille', email: 'camille@cezame.app', password: 'MotDePasse1!', user_metadata: { username: 'Camille' } };
  db.users.push(user);
  db.seed('users', [{ id: user.id, username: 'Camille', is_onboarding_completed: true }]);
  db.seed('progress', [{ id: 'progress-1', user_id: user.id, streak: 2, xp: 120, rank: 'bronze', updated_at: new Date().toISOString() }]);
  return user;
}
