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
});
