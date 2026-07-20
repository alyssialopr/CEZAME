export const TUTORIAL_STORAGE_KEY = '@tutorial_completed';

export type TutorialScreen = 'categories' | 'home' | 'lesson-content' | 'lesson';
export type TutorialStepId =
  | 'category-card'
  | 'lesson-node'
  | 'lesson-intro'
  | 'lesson-question'
  | 'home-logo'
  | 'tab-bar';
export type Placement = 'above' | 'below';

export interface TutorialStep {
  id: TutorialStepId;
  screen: TutorialScreen;
  text: string;
  placement: Placement;
  /** px ajoutés autour du rect mesuré pour le trou spotlight */
  cutoutPadding: number;
  /** padding bas spécifique (si l'élément déborde vers le bas, ex. mascotte) */
  cutoutPaddingBottom?: number;
  /** décalage vertical du trou (positif = descend le spotlight, négatif = monte) */
  cutoutOffsetY?: number;
  /** arrondi des coins du trou */
  cutoutRadius: number;
  ctaLabel: string;
  /** true = pas de bouton "Suivant", on avance en tapant l'élément ciblé */
  requireTap?: boolean;
}

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Ordre : thème → START → contenu → questions → logo → barre d'onglets.
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'category-card',
    screen: 'categories',
    text: 'Choisis un thème pour commencer ton parcours.',
    placement: 'below',
    cutoutPadding: 6,
    // La carte a une mascotte qui déborde ~20px sous le cadre mesuré → on
    // étend le trou vers le bas pour bien recouvrir toute la carte visible.
    cutoutPaddingBottom: 28,
    cutoutOffsetY: 52,
    cutoutRadius: 18,
    ctaLabel: 'Suivant',
    requireTap: true,
  },
  {
    id: 'lesson-node',
    screen: 'home',
    text: 'Appuie sur START pour lancer ta première leçon.',
    placement: 'above',
    cutoutPadding: 8,
    // cutoutOffsetY: 2,
    cutoutRadius: 60,
    ctaLabel: 'Suivant',
    requireTap: true,
  },
  {
    id: 'lesson-intro',
    screen: 'lesson-content',
    text: 'Voici la fiche : lis-la, puis appuie sur CONTINUER pour avancer.',
    placement: 'above',
    cutoutPadding: 8,
    cutoutRadius: 16,
    ctaLabel: 'Suivant',
  },
  {
    id: 'lesson-question',
    screen: 'lesson',
    text: 'Choisis la bonne réponse : tape une proposition pour répondre.',
    placement: 'below',
    cutoutPadding: 8,
    cutoutRadius: 16,
    ctaLabel: 'Suivant',
    requireTap: true,
  },
  {
    id: 'home-logo',
    screen: 'home',
    text: 'De retour à l’accueil ! Le logo CEZAME te ramène aux thèmes pour changer de catégorie.',
    placement: 'below',
    cutoutPadding: 8,
    cutoutRadius: 12,
    ctaLabel: 'Suivant',
  },
  {
    id: 'tab-bar',
    screen: 'home',
    text: 'Et ici ta barre de navigation : Accueil, Profil et Réglages. Bonne exploration !',
    placement: 'above',
    cutoutPadding: 0,
    cutoutRadius: 0,
    ctaLabel: 'Terminer',
  },
];
