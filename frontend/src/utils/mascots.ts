// Mapping centralisé des mascottes Rico de CEZAME

const MASCOT_MAP: Record<string, any> = {
  RicoDocteur: require('@/images/RicoDocteur.svg'),
  RicoEntrepriseDroit: require('@/images/RicoEntrepriseDroit.svg'),
  RicoEntreprise: require('@/images/RicoEntreprise.svg'),
  RicoBleuTravail: require('@/images/RicoBleuTravail.svg'),
  Riconstruction: require('@/images/Riconstruction.svg'),
  RicoHappy: require('@/images/RicoHappy.svg'),
  RicoJoy: require('@/images/RicoJoy.svg'),
};

const CATEGORY_DEFAULT_MASCOTS: Record<string, string> = {
  sante: 'RicoDocteur',
  finance: 'RicoEntrepriseDroit',
  administration: 'RicoEntreprise',
  voiture: 'RicoBleuTravail',
  logement: 'Riconstruction',
};

/**
 * Retourne la source de l'image (SVG) selon le nom de la mascotte,
 * avec repli automatique sur la mascotte par défaut de la catégorie.
 */
export function getMascotSource(
  mascotName?: string | null,
  categoryId?: string
): any {
  if (mascotName && MASCOT_MAP[mascotName]) {
    return MASCOT_MAP[mascotName];
  }

  if (categoryId && CATEGORY_DEFAULT_MASCOTS[categoryId]) {
    const defaultName = CATEGORY_DEFAULT_MASCOTS[categoryId];
    return MASCOT_MAP[defaultName] || MASCOT_MAP.RicoEntreprise;
  }

  return MASCOT_MAP.RicoEntreprise;
}
