export interface UnitBadge {
  key: string;
  label: string;
  description: string;
  category: string;
  iconName: 'PiggyBank' | 'Coins' | 'ShieldCheck' | 'Heart' | 'FileText' | 'Landmark' | 'Car' | 'Key' | 'Award' | 'Sparkles';
  color: string;
}

export interface UnitReward {
  type: 'xp' | 'gems';
  amount: number;
  badge: UnitBadge;
}

export const UNIT_BADGES: Record<string, UnitBadge[]> = {
  finance: [
    {
      key: 'as-du-compte',
      label: 'As du Compte',
      description: 'Compte bancaire ouvert et RIB maîtrisé sans aucun stress !',
      category: 'finance',
      iconName: 'Landmark',
      color: '#3B82F6',
    },
    {
      key: 'as-du-budget',
      label: 'As du Budget',
      description: 'Gère ses premières rentrées et dépenses comme un chef !',
      category: 'finance',
      iconName: 'PiggyBank',
      color: '#5FC97A',
    },
    {
      key: 'epargnant-or',
      label: 'Épargnant d’Or',
      description: 'Maîtrise la règle 50/30/20 et prépare l’avenir sereinement.',
      category: 'finance',
      iconName: 'Coins',
      color: '#F59E0B',
    },
  ],
  sante: [
    {
      key: 'affilie-serein',
      label: 'Affilié Serein',
      description: 'Compte Ameli activé et droits Sécu ouverts en toute tranquillité.',
      category: 'sante',
      iconName: 'ShieldCheck',
      color: '#10B981',
    },
    {
      key: 'bouclier-vital',
      label: 'Bouclier Vital',
      description: 'Déjoue les arnaques et protège sa carte Vitale sans paniquer.',
      category: 'sante',
      iconName: 'Heart',
      color: '#FF6B7A',
    },
    {
      key: 'sante-de-fer',
      label: 'Santé de Fer',
      description: 'Médecin traitant et mutuelle complémentaire maîtrisés à 100%.',
      category: 'sante',
      iconName: 'Sparkles',
      color: '#6366F1',
    },
  ],
  administration: [
    {
      key: 'citoyen-eclaire',
      label: 'Citoyen Éclairé',
      description: "Comprend son statut fiscal et ses démarches citoyennes d'adulte.",
      category: 'administration',
      iconName: 'Landmark',
      color: '#8B5CF6',
    },
    {
      key: 'pro-des-impots',
      label: 'Pro des Impôts',
      description: 'Espace impots.gouv.fr et déclaration en ligne validés sans sueur froide.',
      category: 'administration',
      iconName: 'FileText',
      color: '#3B82F6',
    },
    {
      key: 'pro-demarches',
      label: 'Pro des Démarches',
      description: 'CAF, avis d’impôt et pièces justificatives toujours en ordre.',
      category: 'administration',
      iconName: 'Award',
      color: '#6366F1',
    },
  ],
  voiture: [
    {
      key: 'titulaire-neph',
      label: 'Titulaire NEPH',
      description: 'Inscription ANTS complétée et numéro NEPH officiel en poche.',
      category: 'voiture',
      iconName: 'FileText',
      color: '#8B5CF6',
    },
    {
      key: 'as-du-code',
      label: 'As du Code',
      description: 'Règles de priorité et examen du Code de la route validés haut la main.',
      category: 'voiture',
      iconName: 'Award',
      color: '#10B981',
    },
    {
      key: 'pilote-vigilant',
      label: 'Pilote Vigilant',
      description: 'Assurance, constat et contrôles techniques n’ont plus de secret.',
      category: 'voiture',
      iconName: 'Car',
      color: '#EC4899',
    },
  ],
  logement: [
    {
      key: 'dossier-beton',
      label: 'Dossier Béton',
      description: "Dossier locataire complet et certifié DossierFacile prêt à l'envoi.",
      category: 'logement',
      iconName: 'FileText',
      color: '#3B82F6',
    },
    {
      key: 'garant-en-poche',
      label: 'Garant en Poche',
      description: 'Garantie Visale et caution action logement décrochées facilement.',
      category: 'logement',
      iconName: 'ShieldCheck',
      color: '#10B981',
    },
    {
      key: 'cle-en-main',
      label: 'Clé en Main',
      description: 'Bail signé, état des lieux minutieux et assurance validés.',
      category: 'logement',
      iconName: 'Key',
      color: '#F97316',
    },
  ],
};

const DEFAULT_BADGE: UnitBadge = {
  key: 'explorateur-emerite',
  label: 'Explorateur Émérite',
  description: 'A complété une unité avec brio et persévérance !',
  category: 'general',
  iconName: 'Award',
  color: '#9B6CFF',
};

/**
 * Tirage au sort de la récompense d'un coffre d'unité :
 * - Soit des XP (entre 100 et 250 XP), soit des Diamants (entre 15 et 60 Diamants)
 * - ET un badge thématique garanti lié à l'unité
 */
export function drawUnitReward(categoryId: string, unitIndex: number): UnitReward {
  // 50% de chance pour XP, 50% pour Diamants
  const isGems = Math.random() >= 0.5;

  let rewardType: 'xp' | 'gems' = isGems ? 'gems' : 'xp';
  let amount = 0;

  if (rewardType === 'gems') {
    // Montants possibles en diamants : 15, 20, 25, 30, 40, 50, 60
    const gemOptions = [15, 20, 25, 30, 40, 50, 60];
    amount = gemOptions[Math.floor(Math.random() * gemOptions.length)];
  } else {
    // Montants possibles en XP : 100, 125, 150, 175, 200, 250
    const xpOptions = [100, 125, 150, 175, 200, 250];
    amount = xpOptions[Math.floor(Math.random() * xpOptions.length)];
  }

  // Sélection du badge correspondant
  const categoryBadges = UNIT_BADGES[categoryId] || [];
  const badge = categoryBadges[unitIndex % categoryBadges.length] || DEFAULT_BADGE;

  return {
    type: rewardType,
    amount,
    badge,
  };
}
