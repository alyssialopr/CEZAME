import { drawUnitReward, UNIT_BADGES } from '@/constants/categoryRewards';
import { getCategoryTip } from '@/constants/categoryTips';

describe('drawUnitReward', () => {
  it('donne des XP quand le tirage est sous 0,5', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0);
    expect(drawUnitReward('finance', 0)).toMatchObject({ type: 'xp', amount: 100 });
  });

  it('donne des diamants à partir de 0,5', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0.99);
    expect(drawUnitReward('finance', 0)).toMatchObject({ type: 'gems', amount: 60 });
  });

  it('choisit le badge de la catégorie selon le rang de l’unité', () => {
    const badges = UNIT_BADGES.sante;
    expect(drawUnitReward('sante', 1).badge).toBe(badges[1]);
    expect(drawUnitReward('sante', badges.length).badge).toBe(badges[0]);
  });

  it('retombe sur le badge par défaut pour une catégorie inconnue', () => {
    expect(drawUnitReward('inconnue', 0).badge.key).toBe('explorateur-emerite');
  });

  it('reste dans les montants prévus', () => {
    for (let i = 0; i < 200; i++) {
      const r = drawUnitReward('logement', i);
      const allowed = r.type === 'xp' ? [100, 125, 150, 175, 200, 250] : [15, 20, 25, 30, 40, 50, 60];
      expect(allowed).toContain(r.amount);
    }
  });
});

describe('getCategoryTip', () => {
  it('boucle sur les conseils de la catégorie', () => {
    const first = getCategoryTip('sante', 0);
    expect(first).toBeDefined();
    let len = 1;
    while (getCategoryTip('sante', len) !== first) len++;
    expect(getCategoryTip('sante', len + 1)).toBe(getCategoryTip('sante', 1));
  });

  it('utilise les conseils finance pour une catégorie inconnue', () => {
    expect(getCategoryTip('inconnue', 2)).toBe(getCategoryTip('finance', 2));
  });
});
