// Étapes de l'onboarding et calcul du bilan affiché à la fin.

export const ONBOARDING_STEP_TO_CATEGORY_ID: Record<string, string> = {
  social_security: 'sante',
  bank_account: 'finance',
  driver_licence: 'voiture',
  tax_return: 'administration',
  housing: 'logement',
};

export const STEPS = [
  {
    id: 'social_security',
    title: '🏥 Santé',
    description: 'Commençons par ta couverture santé.',
    questions: [
      { key: 'ameli_account_created', label: 'As-tu créé ton compte Ameli ?' },
      { key: 'vitale_card_requested', label: 'As-tu demandé ta carte Vitale ?' },
      { key: 'has_mutuelle', label: 'As-tu une mutuelle complémentaire ?' },
    ]
  },
  {
    id: 'bank_account',
    title: '💰 Finance',
    description: 'Gérer ton argent au quotidien.',
    questions: [
      { key: 'has_identity_doc', label: 'As-tu une pièce d\'identité valide en ta possession ?' },
      { key: 'has_proof_of_address', label: 'As-tu un justificatif de domicile à ton nom ?' },
      { key: 'has_proof_of_income', label: 'As-tu conservé tes justificatifs de revenus (fiches de paie) ?' },
    ]
  },
  {
    id: 'driver_licence',
    title: '🚗 Voiture',
    description: 'Ton permis et ta mobilité.',
    questions: [
      { key: 'ants_account_created', label: 'As-tu un compte ANTS pour tes démarches ?' },
      { key: 'code_passed', label: 'As-tu réussi le code de la route ?' },
      { key: 'practical_exam_passed', label: 'As-tu réussi l\'examen pratique du permis ?' },
    ]
  },
  {
    id: 'tax_return',
    title: '📄 Administration',
    description: 'Les papiers officiels et impôts.',
    questions: [
      { key: 'must_declare', label: 'Sais-tu si tu dois déclarer tes impôts seul(e) ?' },
      { key: 'impots_account_created', label: 'As-tu un compte impots.gouv.fr actif ?' },
      { key: 'income_collected', label: 'As-tu récupéré l\'ensemble de tes fiches de paie pour l\'année ?' },
    ]
  },
  {
    id: 'housing',
    title: '🏠 Logement',
    description: 'Ton chez-toi et tes garanties.',
    questions: [
      { key: 'has_tenant_file', label: 'As-tu un dossier locataire complet prêt à être envoyé ?' },
      { key: 'has_guarantor', label: 'As-tu un garant physique ou moral ?' },
      { key: 'uses_visale', label: 'Sais-tu ce qu\'est la garantie Visale ou l\'utilises-tu ?' },
    ]
  }
];

export type OnboardingAnswers = Record<string, Record<string, boolean>>;

export function createEmptyAnswers(): OnboardingAnswers {
  return Object.fromEntries(
    STEPS.map((s) => [s.id, Object.fromEntries(s.questions.map((q) => [q.key, false]))])
  );
}

export function computeOnboardingResult(answers: OnboardingAnswers) {
  let totalScore = 0;
  const categoryScores: { id: string; title: string; score: number }[] = [];

  STEPS.forEach(s => {
    let catScore = 0;
    s.questions.forEach(q => {
      if (answers[s.id][q.key]) {
        catScore++;
        totalScore++;
      }
    });
    categoryScores.push({ id: s.id, title: s.title, score: catScore });
  });

  let calculatedRank = 'Apprenti Adulte (Encore beaucoup à découvrir)';
  if (totalScore > 5 && totalScore <= 10) calculatedRank = 'Adulte en Devenir (Sur la bonne voie)';
  if (totalScore > 10) calculatedRank = 'Expert du Quotidien (Prêt à affronter la vie)';

  // Find categories with the lowest scores (weakest)
  categoryScores.sort((a, b) => a.score - b.score);
  const weakestTitles = categoryScores.slice(0, 2).map(c => c.title);
  const weakestIds = categoryScores.slice(0, 2).map(c => c.id);

  return { score: totalScore, rank: calculatedRank, weakCategoryTitles: weakestTitles, weakCategoryIds: weakestIds };
}

// Catégorie recommandée après l'onboarding : celle de l'étape la plus faible.
export function recommendedCategoryId(weakCategoryIds: string[]): string {
  const weakestStepId = weakCategoryIds[0];
  return (weakestStepId && ONBOARDING_STEP_TO_CATEGORY_ID[weakestStepId]) || 'sante';
}
