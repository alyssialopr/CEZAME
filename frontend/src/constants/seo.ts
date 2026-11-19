export const SEO_CONFIG = {
  siteName: 'Cezame',
  defaultTitle: "Cezame — Maîtrise tes démarches et ta vie d'adulte",
  titleTemplate: '%s | Cezame',
  description:
    "Apprends à gérer tes démarches administratives, ta santé, ton budget, ton logement et ta mobilité grâce à des leçons courtes, ludiques et interactives.",
  keywords: [
    'Cezame',
    'démarches administratives',
    "vie d'adulte",
    'autonomie jeunes',
    'éducation financière',
    'impôts jeunes',
    'santé CPAM Ameli',
    'carte Vitale',
    'mutuelle',
    'logement étudiant',
    'CAF APL',
    'permis de conduire ANTS',
    'budget quotidien',
  ].join(', '),
  locale: 'fr_FR',
  lang: 'fr',
  themeColor: '#0F172A',
  backgroundColor: '#FBFAF8',
  siteUrl: 'https://cezame.app',
  logoPath: '/logo.png',
  ogImagePath: '/og-image.png',
  faviconPath: '/favicon.png',
  appleTouchIconPath: '/apple-touch-icon.png',
  twitterCard: 'summary_large_image' as const,
};

export interface PageSeoMetadata {
  title: string;
  description: string;
  noIndex?: boolean;
}

export const ROUTE_SEO: Record<string, PageSeoMetadata> = {
  '/': {
    title: "Cezame — Maîtrise tes démarches et ta vie d'adulte",
    description: SEO_CONFIG.description,
  },
  '/login': {
    title: 'Connexion | Cezame',
    description:
      "Connecte-toi à Cezame pour reprendre ton parcours d'apprentissage sur la santé, les finances, le logement, l'administration et la mobilité.",
  },
  '/signup': {
    title: 'Créer un compte | Cezame',
    description:
      "Rejoins Cezame gratuitement et maîtrise toutes les démarches de la vie d'adulte étape par étape.",
  },
  '/categories': {
    title: "Thèmes d'apprentissage | Cezame",
    description:
      'Explore nos thématiques pratiques : Santé, Finance, Administration, Voiture et Logement.',
  },
  '/profile': {
    title: 'Mon Profil & Progression | Cezame',
    description: 'Consulte ta série de jours, tes XP, tes gemmes et tes badges sur Cezame.',
    noIndex: true,
  },
  '/settings': {
    title: 'Paramètres | Cezame',
    description: 'Configure ton compte et tes préférences sur Cezame.',
    noIndex: true,
  },
  '/lesson-content': {
    title: 'Cours & Fiche Mémo | Cezame',
    description: "Découvre l'essentiel à retenir avant de passer aux exercices pratiques.",
    noIndex: true,
  },
  '/lesson': {
    title: 'Quiz Interactif | Cezame',
    description: 'Teste tes connaissances avec des exercices concrets du quotidien.',
    noIndex: true,
  },
  '/score': {
    title: 'Leçon terminée ! | Cezame',
    description: 'Bravo ! Découvre ton score et tes récompenses sur Cezame.',
    noIndex: true,
  },
};

export function getSeoForPathname(pathname: string | null | undefined): PageSeoMetadata {
  if (!pathname) {
    return {
      title: SEO_CONFIG.defaultTitle,
      description: SEO_CONFIG.description,
    };
  }

  const normalized = pathname === '' ? '/' : pathname;
  if (ROUTE_SEO[normalized]) {
    return ROUTE_SEO[normalized];
  }

  if (normalized.startsWith('/category/')) {
    return {
      title: 'Parcours Thématique | Cezame',
      description: SEO_CONFIG.description,
    };
  }

  return {
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.description,
  };
}

export function getStructuredDataJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'EducationalApplication',
    name: SEO_CONFIG.siteName,
    headline: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web, iOS, Android',
    inLanguage: 'fr-FR',
    image: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.logoPath}`,
    url: SEO_CONFIG.siteUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
  });
}
