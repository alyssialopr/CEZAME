import { getMascotSource } from '@/utils/mascots';

describe('getMascotSource', () => {
  it('renvoie la mascotte demandée', () => {
    expect(getMascotSource('RicoJoy')).toEqual(require('@/images/RicoJoy.svg'));
  });

  it('retombe sur la mascotte de la catégorie', () => {
    expect(getMascotSource('Inconnu', 'sante')).toEqual(require('@/images/RicoDocteur.svg'));
    expect(getMascotSource(null, 'logement')).toEqual(require('@/images/Riconstruction.svg'));
  });

  it('retombe sur RicoEntreprise sinon', () => {
    expect(getMascotSource()).toEqual(require('@/images/RicoEntreprise.svg'));
    expect(getMascotSource(undefined, 'inconnue')).toEqual(require('@/images/RicoEntreprise.svg'));
  });

  it('renvoie les émotions statiques par variation (FR et EN)', () => {
    expect(getMascotSource('RicoDocteur', undefined, 'cold')).toEqual(
      require('@/images/emotions/RicoDocteur_Cold.png')
    );
    expect(getMascotSource(null, 'logement', 'surpris')).toEqual(
      require('@/images/emotions/Riconstruction_Surprised.png')
    );
    expect(getMascotSource('RicoBleuTravail', undefined, 'enerve')).toEqual(
      require('@/images/emotions/RicoBleuTravail_Angry.png')
    );
    expect(getMascotSource('RicoHappy', undefined, 'warm')).toEqual(
      require('@/images/emotions/RicoHappy_Warm.png')
    );
    expect(getMascotSource('RicoHappy', undefined, 'triste')).toEqual(
      require('@/images/emotions/RicoHappy_Sad.png')
    );
  });
});
