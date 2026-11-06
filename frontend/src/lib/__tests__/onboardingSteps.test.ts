import {
  STEPS,
  computeOnboardingResult,
  createEmptyAnswers,
  recommendedCategoryId,
} from '@/lib/onboardingSteps';

function answersWith(yes: Record<string, number>) {
  const answers = createEmptyAnswers();
  for (const step of STEPS) {
    step.questions.slice(0, yes[step.id] ?? 0).forEach((q) => (answers[step.id][q.key] = true));
  }
  return answers;
}

describe('onboarding', () => {
  it('a 5 étapes de 3 questions, toutes à non au départ', () => {
    expect(STEPS).toHaveLength(5);
    const answers = createEmptyAnswers();
    expect(Object.keys(answers)).toEqual(['social_security', 'bank_account', 'driver_licence', 'tax_return', 'housing']);
    Object.values(answers).forEach((a) => {
      expect(Object.values(a)).toEqual([false, false, false]);
    });
  });

  it('donne le rang débutant à 5 oui ou moins', () => {
    const r = computeOnboardingResult(answersWith({ social_security: 3, bank_account: 2 }));
    expect(r.score).toBe(5);
    expect(r.rank).toMatch(/^Apprenti Adulte/);
  });

  it('donne le rang intermédiaire de 6 à 10 oui', () => {
    const r = computeOnboardingResult(answersWith({ social_security: 3, bank_account: 3, housing: 1 }));
    expect(r.score).toBe(7);
    expect(r.rank).toMatch(/^Adulte en Devenir/);
  });

  it('donne le rang expert au-delà de 10 oui', () => {
    const r = computeOnboardingResult(answersWith({ social_security: 3, bank_account: 3, driver_licence: 3, tax_return: 2 }));
    expect(r.score).toBe(11);
    expect(r.rank).toMatch(/^Expert du Quotidien/);
  });

  it('retient les deux domaines les plus faibles', () => {
    const r = computeOnboardingResult(
      answersWith({ social_security: 3, bank_account: 1, driver_licence: 3, tax_return: 0, housing: 2 })
    );
    expect(r.weakCategoryIds).toEqual(['tax_return', 'bank_account']);
    expect(r.weakCategoryTitles).toEqual(['📄 Administration', '💰 Finance']);
  });

  it('recommande la catégorie du domaine le plus faible', () => {
    expect(recommendedCategoryId(['tax_return', 'bank_account'])).toBe('administration');
    expect(recommendedCategoryId(['driver_licence'])).toBe('voiture');
    expect(recommendedCategoryId([])).toBe('sante');
    expect(recommendedCategoryId(['inconnu'])).toBe('sante');
  });
});
