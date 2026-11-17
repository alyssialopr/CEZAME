// Mapping centralisé des mascottes Rico de CEZAME

export type RicoVariation =
  | 'RicoDocteur'
  | 'RicoEntrepriseDroit'
  | 'RicoEntreprise'
  | 'RicoBleuTravail'
  | 'Riconstruction';

export type RicoEmotion =
  | 'default'
  | 'sad'
  | 'surprised'
  | 'thoughtful'
  | 'proud'
  | 'worried'
  | 'cold'
  | 'warm'
  | 'angry'
  | 'triste'
  | 'surpris'
  | 'reflechi'
  | 'fiere'
  | 'inquiet'
  | 'froid'
  | 'rechauffe'
  | 'enerve';

type CanonicalEmotion =
  | 'Sad'
  | 'Surprised'
  | 'Thoughtful'
  | 'Proud'
  | 'Worried'
  | 'Cold'
  | 'Warm'
  | 'Angry';

const EMOTION_ALIASES: Record<string, CanonicalEmotion> = {
  sad: 'Sad',
  triste: 'Sad',
  surprised: 'Surprised',
  surpris: 'Surprised',
  thoughtful: 'Thoughtful',
  reflechi: 'Thoughtful',
  proud: 'Proud',
  fiere: 'Proud',
  fier: 'Proud',
  worried: 'Worried',
  inquiet: 'Worried',
  cold: 'Cold',
  froid: 'Cold',
  warm: 'Warm',
  rechauffe: 'Warm',
  angry: 'Angry',
  enerve: 'Angry',
};

const MASCOT_MAP: Record<string, any> = {
  RicoDocteur: require('@/images/RicoDocteur.svg'),
  RicoEntrepriseDroit: require('@/images/RicoEntrepriseDroit.svg'),
  RicoEntreprise: require('@/images/RicoEntreprise.svg'),
  RicoBleuTravail: require('@/images/RicoBleuTravail.svg'),
  Riconstruction: require('@/images/Riconstruction.svg'),
  RicoHappy: require('@/images/RicoHappy.svg'),
  RicoJoy: require('@/images/RicoJoy.svg'),
};

const MASCOT_EMOTION_MAP: Record<RicoVariation, Record<CanonicalEmotion, any>> = {
  RicoDocteur: {
    Sad: require('@/images/emotions/RicoDocteur_Sad.png'),
    Surprised: require('@/images/emotions/RicoDocteur_Surprised.png'),
    Thoughtful: require('@/images/emotions/RicoDocteur_Thoughtful.png'),
    Proud: require('@/images/emotions/RicoDocteur_Proud.png'),
    Worried: require('@/images/emotions/RicoDocteur_Worried.png'),
    Cold: require('@/images/emotions/RicoDocteur_Cold.png'),
    Warm: require('@/images/emotions/RicoDocteur_Warm.png'),
    Angry: require('@/images/emotions/RicoDocteur_Angry.png'),
  },
  RicoEntreprise: {
    Sad: require('@/images/emotions/RicoEntreprise_Sad.png'),
    Surprised: require('@/images/emotions/RicoEntreprise_Surprised.png'),
    Thoughtful: require('@/images/emotions/RicoEntreprise_Thoughtful.png'),
    Proud: require('@/images/emotions/RicoEntreprise_Proud.png'),
    Worried: require('@/images/emotions/RicoEntreprise_Worried.png'),
    Cold: require('@/images/emotions/RicoEntreprise_Cold.png'),
    Warm: require('@/images/emotions/RicoEntreprise_Warm.png'),
    Angry: require('@/images/emotions/RicoEntreprise_Angry.png'),
  },
  RicoEntrepriseDroit: {
    Sad: require('@/images/emotions/RicoEntrepriseDroit_Sad.png'),
    Surprised: require('@/images/emotions/RicoEntrepriseDroit_Surprised.png'),
    Thoughtful: require('@/images/emotions/RicoEntrepriseDroit_Thoughtful.png'),
    Proud: require('@/images/emotions/RicoEntrepriseDroit_Proud.png'),
    Worried: require('@/images/emotions/RicoEntrepriseDroit_Worried.png'),
    Cold: require('@/images/emotions/RicoEntrepriseDroit_Cold.png'),
    Warm: require('@/images/emotions/RicoEntrepriseDroit_Warm.png'),
    Angry: require('@/images/emotions/RicoEntrepriseDroit_Angry.png'),
  },
  RicoBleuTravail: {
    Sad: require('@/images/emotions/RicoBleuTravail_Sad.png'),
    Surprised: require('@/images/emotions/RicoBleuTravail_Surprised.png'),
    Thoughtful: require('@/images/emotions/RicoBleuTravail_Thoughtful.png'),
    Proud: require('@/images/emotions/RicoBleuTravail_Proud.png'),
    Worried: require('@/images/emotions/RicoBleuTravail_Worried.png'),
    Cold: require('@/images/emotions/RicoBleuTravail_Cold.png'),
    Warm: require('@/images/emotions/RicoBleuTravail_Warm.png'),
    Angry: require('@/images/emotions/RicoBleuTravail_Angry.png'),
  },
  Riconstruction: {
    Sad: require('@/images/emotions/Riconstruction_Sad.png'),
    Surprised: require('@/images/emotions/Riconstruction_Surprised.png'),
    Thoughtful: require('@/images/emotions/Riconstruction_Thoughtful.png'),
    Proud: require('@/images/emotions/Riconstruction_Proud.png'),
    Worried: require('@/images/emotions/Riconstruction_Worried.png'),
    Cold: require('@/images/emotions/Riconstruction_Cold.png'),
    Warm: require('@/images/emotions/Riconstruction_Warm.png'),
    Angry: require('@/images/emotions/Riconstruction_Angry.png'),
  },
};

const CATEGORY_DEFAULT_MASCOTS: Record<string, RicoVariation> = {
  sante: 'RicoDocteur',
  finance: 'RicoEntrepriseDroit',
  administration: 'RicoEntreprise',
  voiture: 'RicoBleuTravail',
  logement: 'Riconstruction',
};

function resolveVariation(mascotName?: string | null, categoryId?: string): string {
  if (mascotName && MASCOT_MAP[mascotName]) {
    return mascotName;
  }
  if (categoryId && CATEGORY_DEFAULT_MASCOTS[categoryId]) {
    return CATEGORY_DEFAULT_MASCOTS[categoryId];
  }
  return 'RicoEntreprise';
}

/**
 * Retourne la source de l'image (SVG par défaut ou PNG d'émotion)
 * selon le nom de la mascotte, la catégorie et l'émotion demandée.
 */
export function getMascotSource(
  mascotName?: string | null,
  categoryId?: string,
  emotion?: RicoEmotion | null
): any {
  const resolved = resolveVariation(mascotName, categoryId);

  if (emotion && emotion !== 'default') {
    const canonical = EMOTION_ALIASES[emotion.toLowerCase()];
    const variationMap = MASCOT_EMOTION_MAP[resolved as RicoVariation];
    if (canonical && variationMap?.[canonical]) {
      return variationMap[canonical];
    }
  }

  return MASCOT_MAP[resolved] || MASCOT_MAP.RicoEntreprise;
}
