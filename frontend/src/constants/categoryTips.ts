export interface CategoryTip {
  type: 'tip' | 'boost';
  title: string;
  text: string;
}

export const CATEGORY_TIPS: Record<string, CategoryTip[]> = {
  finance: [
    {
      type: 'tip',
      title: 'Conseil de Rico',
      text: 'Active les alertes de solde de ton appli bancaire pour anticiper le découvert.',
    },
    {
      type: 'boost',
      title: 'Bien joué !',
      text: 'Gérer ton budget pas à pas, c’est t’assurer l’esprit tranquille.',
    },
    {
      type: 'tip',
      title: 'Règle 50/30/20',
      text: '50% pour les besoins, 30% pour les envies, 20% pour l’épargne.',
    },
  ],
  sante: [
    {
      type: 'tip',
      title: 'Conseil Sécu',
      text: 'Un SMS demandant de payer ta carte Vitale ? C’est toujours une arnaque !',
    },
    {
      type: 'boost',
      title: 'Prends soin de toi !',
      text: 'Le médecin traitant t’assure le meilleur taux de remboursement.',
    },
    {
      type: 'tip',
      title: 'En voyage ?',
      text: 'Demande ta Carte Européenne d’Assurance Maladie 15 jours avant de partir.',
    },
  ],
  administration: [
    {
      type: 'tip',
      title: 'Conseil CAF',
      text: 'Déclare tout changement de situation dans le mois pour éviter les trop-perçus.',
    },
    {
      type: 'boost',
      title: 'Bravo !',
      text: 'Faire ses démarches sans stress, ça s’apprend et tu y arrives !',
    },
    {
      type: 'tip',
      title: 'Bon réflexe',
      text: 'Garde tes avis d’imposition au moins 3 ans, ils servent de justificatif partout.',
    },
  ],
  voiture: [
    {
      type: 'tip',
      title: 'Conseil Route',
      text: 'Vérifie la pression de tes pneus une fois par mois pour ta sécurité.',
    },
    {
      type: 'boost',
      title: 'En route !',
      text: 'Chaque étape validée te rapproche d’une conduite 100% sereine.',
    },
    {
      type: 'tip',
      title: 'Assurance',
      text: 'L’assurance au tiers est le minimum légal obligatoire pour rouler.',
    },
  ],
  logement: [
    {
      type: 'tip',
      title: 'Dossier locataire',
      text: 'Prépare tes justificatifs dans un PDF unique clair pour te démarquer.',
    },
    {
      type: 'boost',
      title: 'Ton futur chez-toi !',
      text: 'Un état des lieux minutieux avec photos te protège au départ.',
    },
    {
      type: 'tip',
      title: 'Garantie Visale',
      text: 'Moins de 30 ans ? Pense à la garantie Visale gratuite pour ton garant.',
    },
  ],
};

/**
 * Retourne un conseil ou encouragement pour la catégorie à un index donné
 */
export function getCategoryTip(categoryId: string, index: number = 0): CategoryTip {
  const tips = CATEGORY_TIPS[categoryId] || CATEGORY_TIPS.finance;
  return tips[index % tips.length];
}
