export type LessonOption = {
  letter: "A" | "B" | "C";
  text: string;
  correct?: boolean;
};

export type LessonQuestion = {
  category: string;
  prompt: string;
  options: LessonOption[];
  explanation: string;
};

export type LessonScreen = {
  title: string;
  body: string;
  tip?: string;
};

export type LessonUnit = {
  title: string;
  screens: LessonScreen[];
  questions: LessonQuestion[];
};

export const LESSONS: Record<string, LessonUnit> = {
  finance: {
    title: "Gérer ton argent au quotidien",
    screens: [
      {
        title: "Ton compte au quotidien",
        body: "Ton compte courant sert à recevoir de l'argent et payer tes dépenses. Le RIB est sa « carte d'identité » : tu le donnes pour recevoir un virement (salaire, CAF) ou autoriser un prélèvement (abonnement, loyer). Un prélèvement peut toujours être annulé depuis ta banque.",
      },
      {
        title: "Le découvert et les agios",
        body: "Être à découvert = avoir un solde négatif. Si ta banque l'autorise, ce n'est pas gratuit : elle prélève des agios (des frais). Sans autorisation, les frais explosent et des paiements peuvent être rejetés. Le découvert n'est pas de l'argent en plus, c'est une dette.",
        tip: "Bon réflexe : active les notifications de solde de ton appli bancaire — tu vois le découvert arriver.",
      },
      {
        title: "Épargner, même un peu",
        body: "Le Livret A est l'épargne de base : sans risque, sans frais, et l'argent reste disponible à tout moment. Une méthode simple pour ton budget : la règle 50/30/20 — environ 50 % pour les besoins (loyer, courses), 30 % pour les envies, 20 % pour l'épargne.",
      },
      {
        title: "Les réflexes qui sauvent",
        body: "Carte perdue ou volée : fais opposition immédiatement depuis l'appli ou par téléphone — chaque minute compte. Avant de choisir une banque, compare les frais réels : cotisation de carte, tenue de compte, frais à l'étranger. Ils varient beaucoup d'une banque à l'autre.",
      },
    ],
    questions: [
      {
        category: "Le découvert et les agios",
        prompt: "Le découvert autorisé, c'est :",
        options: [
          { letter: "A", text: "Un solde négatif toléré, mais avec des frais", correct: true },
          { letter: "B", text: "De l'argent gratuit prêté par la banque" },
          { letter: "C", text: "Interdit avant 25 ans" },
        ],
        explanation: "La banque tolère le négatif mais facture des agios. C'est une dette, pas un bonus.",
      },
      {
        category: "Ton compte au quotidien",
        prompt: "On te demande ton RIB. C'est pour :",
        options: [
          { letter: "A", text: "Recevoir un virement ou mettre en place un prélèvement", correct: true },
          { letter: "B", text: "Payer en magasin" },
          { letter: "C", text: "Prouver ton identité" },
        ],
        explanation: "Le RIB identifie ton compte — indispensable pour le salaire, la CAF ou un abonnement.",
      },
      {
        category: "Le découvert et les agios",
        prompt: "Les agios, c'est :",
        options: [
          { letter: "A", text: "Des frais quand ton compte est à découvert", correct: true },
          { letter: "B", text: "Des intérêts que la banque te verse" },
          { letter: "C", text: "Une prime de bienvenue" },
        ],
        explanation: "Plus tu restes à découvert longtemps, plus les agios s'accumulent.",
      },
      {
        category: "Les réflexes qui sauvent",
        prompt: "Tu perds ta carte bancaire. Tu fais quoi en premier ?",
        options: [
          { letter: "A", text: "Opposition immédiate (appli ou téléphone)", correct: true },
          { letter: "B", text: "Tu attends de voir si quelqu'un l'utilise" },
          { letter: "C", text: "Tu changes de banque" },
        ],
        explanation:
          "L'opposition bloque la carte instantanément. Attendre, c'est risquer de payer les achats d'un voleur.",
      },
      {
        category: "Épargner, même un peu",
        prompt: "Le Livret A, c'est :",
        options: [
          { letter: "A", text: "Une épargne disponible à tout moment, sans risque", correct: true },
          { letter: "B", text: "Un compte bloqué pendant 5 ans" },
          { letter: "C", text: "Un placement réservé aux mineurs" },
        ],
        explanation: "Tu peux retirer quand tu veux, sans frais. C'est la première brique d'épargne idéale.",
      },
      {
        category: "Ton compte au quotidien",
        prompt: "Un prélèvement automatique, c'est :",
        options: [
          {
            letter: "A",
            text: "Une autorisation donnée à un organisme de prélever ton compte",
            correct: true,
          },
          { letter: "B", text: "Impossible à annuler une fois activé" },
          { letter: "C", text: "Réservé au paiement des impôts" },
        ],
        explanation:
          "Tu peux le révoquer à tout moment depuis ta banque, par exemple pour stopper un abonnement.",
      },
      {
        category: "Les réflexes qui sauvent",
        prompt: "Les frais bancaires (carte, tenue de compte) :",
        options: [
          { letter: "A", text: "Varient selon les banques, il faut comparer", correct: true },
          { letter: "B", text: "Sont fixés par l'État, identiques partout" },
          { letter: "C", text: "Sont interdits par la loi" },
        ],
        explanation: "D'une banque à l'autre, la même carte peut coûter 0 € ou plus de 100 € par an.",
      },
      {
        category: "Épargner, même un peu",
        prompt: "La règle 50/30/20 pour gérer son budget, c'est :",
        options: [
          { letter: "A", text: "Besoins / envies / épargne", correct: true },
          { letter: "B", text: "Loyer / courses / sorties" },
          { letter: "C", text: "Un taux d'intérêt bancaire" },
        ],
        explanation: "50 % besoins, 30 % envies, 20 % épargne — un repère simple, à adapter à ta situation.",
      },
    ],
  },
  sante: {
    title: "Se soigner sans galérer",
    screens: [
      {
        title: "La Sécu et ta carte Vitale",
        body: "En France, l'Assurance maladie (la « Sécu ») rembourse une partie de tes frais de santé. Ta carte Vitale contient tes droits : tu la présentes à chaque rendez-vous et le remboursement est automatique. Elle est 100 % gratuite — on ne te demandera jamais de payer pour l'obtenir.",
        tip: "Bon réflexe : un SMS te demande de payer ta carte Vitale ? C'est une arnaque, toujours.",
      },
      {
        title: "Le médecin traitant",
        body: "Tu dois déclarer un médecin traitant : c'est ton médecin de référence. Sans lui, tu sors du « parcours de soins » et la Sécu te rembourse beaucoup moins. La déclaration se fait chez le médecin ou sur ameli.fr, en 2 minutes.",
      },
      {
        title: "Les documents à connaître",
        body: "Attestation de droits : prouve ton rattachement à l'Assurance maladie (téléchargeable sur ameli.fr). Ordonnance : rédigée par un médecin, valable en général 3 mois pour des médicaments. Mutuelle : complémentaire qui rembourse ce que la Sécu ne couvre pas.",
      },
      {
        title: "Les bons réflexes",
        body: "Urgence vitale : appelle le 15 (SAMU). Carte Vitale perdue : déclare la perte sur ameli.fr et commandes-en une nouvelle. Vacances en Europe : demande la carte européenne d'assurance maladie, gratuite, sur Ameli, au moins 15 jours avant le départ.",
        tip: "Bon réflexe : le tiers payant = tu n'avances pas les frais. Demande s'il est possible.",
      },
    ],
    questions: [
      {
        category: "Le médecin traitant",
        prompt: "Tu n'as pas déclaré de médecin traitant. Que se passe-t-il ?",
        options: [
          { letter: "A", text: "Tu es moins bien remboursé", correct: true },
          { letter: "B", text: "On refuse de te soigner" },
          { letter: "C", text: "Rien, ça ne change rien" },
        ],
        explanation:
          "Hors parcours de soins, la Sécu rembourse beaucoup moins. Déclarer un médecin traitant prend 2 minutes.",
      },
      {
        category: "La Sécu et ta carte Vitale",
        prompt: "Commander sa carte Vitale, ça coûte :",
        options: [
          { letter: "A", text: "Rien, elle est gratuite", correct: true },
          { letter: "B", text: "Environ 25 €" },
          { letter: "C", text: "C'est payant après 25 ans" },
        ],
        explanation: "Elle est toujours gratuite. Les SMS qui demandent de payer sont des arnaques.",
      },
      {
        category: "Les bons réflexes",
        prompt: "Urgence vitale : quel numéro tu composes ?",
        options: [
          { letter: "A", text: "Le 15 (SAMU)", correct: true },
          { letter: "B", text: "Le 3646 (Ameli)" },
          { letter: "C", text: "Ton médecin traitant" },
        ],
        explanation: "Le 15, c'est le SAMU, 24h/24. Le 3646 sert pour les questions administratives Ameli.",
      },
      {
        category: "Les documents à connaître",
        prompt: "Une mutuelle (complémentaire santé) sert à :",
        options: [
          { letter: "A", text: "Rembourser ce que la Sécu ne couvre pas", correct: true },
          { letter: "B", text: "Remplacer la carte Vitale" },
          { letter: "C", text: "Choisir ton médecin à ta place" },
        ],
        explanation:
          "La Sécu ne rembourse qu'une partie. La mutuelle complète, par exemple pour les lunettes ou le dentaire.",
      },
      {
        category: "Les bons réflexes",
        prompt: "Tu as perdu ta carte Vitale. Ton premier réflexe :",
        options: [
          { letter: "A", text: "Déclarer la perte sur ameli.fr", correct: true },
          { letter: "B", text: "Porter plainte au commissariat" },
          { letter: "C", text: "Attendre, une nouvelle arrive toute seule" },
        ],
        explanation:
          "Tout se fait sur ameli.fr — déclaration de perte puis commande d'une nouvelle carte.",
      },
      {
        category: "Les bons réflexes",
        prompt: "Le tiers payant, c'est :",
        options: [
          { letter: "A", text: "Ne pas avancer les frais chez le médecin", correct: true },
          { letter: "B", text: "Payer en trois fois" },
          { letter: "C", text: "Une carte pour une troisième personne" },
        ],
        explanation:
          "Avec le tiers payant, la Sécu (et parfois la mutuelle) paie directement — tu ne sors rien de ta poche.",
      },
      {
        category: "Les documents à connaître",
        prompt: "Une ordonnance pour des médicaments est en général valable :",
        options: [
          { letter: "A", text: "3 mois", correct: true },
          { letter: "B", text: "1 semaine" },
          { letter: "C", text: "Sans limite de durée" },
        ],
        explanation:
          "En général 3 mois pour la première délivrance. Passé ce délai, il faut retourner voir le médecin.",
      },
      {
        category: "Les bons réflexes",
        prompt: "Tu pars en vacances dans l'Union européenne. Côté santé :",
        options: [
          { letter: "A", text: "Tu demandes la carte européenne gratuite sur Ameli", correct: true },
          { letter: "B", text: "Ta carte Vitale marche partout en Europe" },
          { letter: "C", text: "Tu dois payer une assurance à l'aéroport" },
        ],
        explanation:
          "La carte Vitale ne marche qu'en France. La carte européenne d'assurance maladie est gratuite — demande-la 15 jours avant.",
      },
    ],
  },
  administration: {
    title: "Impôts et CAF sans stress",
    screens: [
      {
        title: "C'est quoi les impôts ?",
        body: "Les impôts financent les services publics : école, routes, hôpitaux. Dès 18 ans, tu as le choix : rester rattaché à la déclaration de tes parents, ou déclarer seul tes revenus. Déclarer est obligatoire même si, au final, tu ne paies rien.",
      },
      {
        title: "La déclaration en pratique",
        body: "Tout se passe sur impots.gouv.fr, chaque printemps. Tu indiques tes revenus de l'année précédente ; l'administration calcule et t'envoie un avis d'imposition. Ce document sert ensuite de justificatif pour plein de démarches : logement, bourses, aides.",
        tip: "Bon réflexe : garde tes avis d'imposition au moins 3 ans.",
      },
      {
        title: "La CAF et les aides",
        body: "La CAF verse des aides selon ta situation : pour les jeunes, c'est surtout l'aide au logement (APL). Ton dossier a un numéro allocataire — note-le. Pour toute demande, prépare un justificatif de domicile et tes revenus.",
      },
      {
        title: "Les pièges à éviter",
        body: "Piège n°1 : oublier de déclarer un changement de situation (déménagement, emploi) à la CAF. Elle continue de verser, puis réclame le trop-perçu — parfois des centaines d'euros à rembourser. Piège n°2 : oublier la déclaration d'impôts. Si tu es perdu, les espaces France services t'aident gratuitement.",
        tip: "Bon réflexe : un changement de situation ? Déclare-le à la CAF dans le mois.",
      },
    ],
    questions: [
      {
        category: "C'est quoi les impôts ?",
        prompt: "À 18 ans, pour les impôts, tu peux :",
        options: [
          { letter: "A", text: "Rester rattaché à tes parents ou déclarer seul", correct: true },
          { letter: "B", text: "Être obligé de déclarer seul immédiatement" },
          { letter: "C", text: "Ne rien faire jusqu'à 25 ans" },
        ],
        explanation:
          "Le rattachement au foyer parental reste possible plusieurs années, souvent avantageux pour les étudiants.",
      },
      {
        category: "La déclaration en pratique",
        prompt: "La déclaration de revenus se fait principalement :",
        options: [
          { letter: "A", text: "En ligne sur impots.gouv.fr", correct: true },
          { letter: "B", text: "À la mairie" },
          { letter: "C", text: "À la CAF" },
        ],
        explanation: "impots.gouv.fr est le site officiel. La déclaration en ligne est la règle.",
      },
      {
        category: "C'est quoi les impôts ?",
        prompt: "Déclarer ses revenus est obligatoire :",
        options: [
          { letter: "A", text: "Même si au final tu ne paies aucun impôt", correct: true },
          { letter: "B", text: "Seulement au-dessus de 30 000 € par an" },
          { letter: "C", text: "Seulement si tu es propriétaire" },
        ],
        explanation:
          "Déclarer ≠ payer. Et l'avis d'imposition obtenu sert de justificatif pour plein de démarches.",
      },
      {
        category: "La CAF et les aides",
        prompt: "Pour une demande d'aide à la CAF, on te demande souvent :",
        options: [
          { letter: "A", text: "Justificatif de domicile et revenus", correct: true },
          { letter: "B", text: "Ton permis de conduire" },
          { letter: "C", text: "Ton carnet de santé" },
        ],
        explanation: "Les aides dépendent de ta situation et de tes ressources — il faut les prouver.",
      },
      {
        category: "Les pièges à éviter",
        prompt: "Tu déménages ou tu trouves un emploi. Côté CAF :",
        options: [
          { letter: "A", text: "Tu déclares vite le changement pour éviter un trop-perçu", correct: true },
          { letter: "B", text: "Tu attends la fin de l'année" },
          { letter: "C", text: "Rien, la CAF est prévenue automatiquement" },
        ],
        explanation:
          "Le trop-perçu, c'est de l'argent versé en trop… que la CAF te réclame ensuite. Le piège n°1 des jeunes allocataires.",
      },
      {
        category: "Les pièges à éviter",
        prompt: "Un courrier recommandé avec accusé de réception sert à :",
        options: [
          { letter: "A", text: "Prouver l'envoi et la réception", correct: true },
          { letter: "B", text: "Faire arriver la lettre plus vite" },
          { letter: "C", text: "Éviter de payer le timbre" },
        ],
        explanation:
          "Indispensable pour les démarches à valeur juridique — résilier un bail, contester une décision…",
      },
      {
        category: "Les pièges à éviter",
        prompt: "Tu es perdu dans une démarche en ligne. Qui peut t'aider gratuitement ?",
        options: [
          { letter: "A", text: "Un espace France services", correct: true },
          { letter: "B", text: "Uniquement un avocat payant" },
          { letter: "C", text: "Personne, tu dois te débrouiller" },
        ],
        explanation:
          "Il y en a partout en France — des agents t'accompagnent gratuitement pour la CAF, les impôts, Ameli…",
      },
      {
        category: "La déclaration en pratique",
        prompt: "Tes avis d'imposition, tu les gardes :",
        options: [
          { letter: "A", text: "Au moins 3 ans", correct: true },
          { letter: "B", text: "Tu peux les jeter tout de suite" },
          { letter: "C", text: "6 mois maximum" },
        ],
        explanation:
          "L'administration peut te les demander plusieurs années après. Et ils servent de justificatif de revenus.",
      },
    ],
  },
  logement: {
    title: "Ton premier appart",
    screens: [
      {
        title: "Le bail, ton contrat",
        body: "Le bail est le contrat entre toi (locataire) et le propriétaire. Il fixe le loyer, les charges, la durée. Lis-le avant de signer : c'est lui qui fait foi en cas de désaccord. Le propriétaire te demandera aussi une attestation d'assurance habitation — elle est obligatoire pour le locataire.",
      },
      {
        title: "Dépôt de garantie et état des lieux",
        body: "Le dépôt de garantie (max 1 mois de loyer hors charges pour un logement vide) est rendu à ton départ… si le logement est en bon état. D'où l'importance de l'état des lieux d'entrée : note TOUT défaut, photos à l'appui. C'est lui qu'on compare à la sortie.",
        tip: "Bon réflexe : photographie chaque pièce le jour de l'entrée, avec la date.",
      },
      {
        title: "Les aides et le garant",
        body: "L'APL, versée par la CAF, peut réduire ton loyer : fais la simulation sur caf.fr avant même de signer. Le propriétaire demande souvent un garant — quelqu'un qui paiera si tu ne peux plus. Pas de garant ? La garantie Visale (Action Logement) est gratuite pour les jeunes.",
      },
      {
        title: "Pendant et après la location",
        body: "Chaque mois, tu peux demander une quittance de loyer gratuite : c'est ta preuve de paiement (utile comme justificatif de domicile). Pour partir : préavis par recommandé — 1 mois en zone tendue (grandes villes), 3 mois ailleurs pour un logement vide.",
      },
    ],
    questions: [
      {
        category: "Dépôt de garantie et état des lieux",
        prompt: "Le dépôt de garantie pour une location vide, c'est au maximum :",
        options: [
          { letter: "A", text: "1 mois de loyer hors charges", correct: true },
          { letter: "B", text: "3 mois de loyer" },
          { letter: "C", text: "Le montant que veut le propriétaire" },
        ],
        explanation:
          "C'est la loi — 1 mois hors charges pour un logement vide (2 mois pour un meublé).",
      },
      {
        category: "Pendant et après la location",
        prompt: "En zone tendue (grandes villes), ton préavis de départ est de :",
        options: [
          { letter: "A", text: "1 mois", correct: true },
          { letter: "B", text: "3 mois dans tous les cas" },
          { letter: "C", text: "6 mois" },
        ],
        explanation:
          "1 mois en zone tendue, 3 mois ailleurs (logement vide). À envoyer en recommandé avec AR.",
      },
      {
        category: "Dépôt de garantie et état des lieux",
        prompt: "L'état des lieux d'entrée sert surtout à :",
        options: [
          {
            letter: "A",
            text: "Comparer avec la sortie pour récupérer ton dépôt de garantie",
            correct: true,
          },
          { letter: "B", text: "Fixer le montant du loyer" },
          { letter: "C", text: "Choisir la décoration" },
        ],
        explanation:
          "Tout défaut non noté à l'entrée peut t'être facturé à la sortie. Sois minutieux, prends des photos.",
      },
      {
        category: "Le bail, ton contrat",
        prompt: "L'assurance habitation quand tu es locataire :",
        options: [
          { letter: "A", text: "Obligatoire, à présenter à la signature du bail", correct: true },
          { letter: "B", text: "Facultative" },
          { letter: "C", text: "Payée par le propriétaire" },
        ],
        explanation:
          "Sans attestation d'assurance, le propriétaire peut refuser de te remettre les clés.",
      },
      {
        category: "Pendant et après la location",
        prompt: "La quittance de loyer :",
        options: [
          { letter: "A", text: "Est gratuite, sur simple demande au propriétaire", correct: true },
          { letter: "B", text: "Coûte quelques euros par mois" },
          { letter: "C", text: "Est délivrée par la CAF" },
        ],
        explanation: "Le propriétaire ne peut pas la facturer. Elle sert aussi de justificatif de domicile.",
      },
      {
        category: "Les aides et le garant",
        prompt: "Pour savoir si tu as droit aux APL :",
        options: [
          { letter: "A", text: "Tu fais une simulation sur caf.fr", correct: true },
          { letter: "B", text: "Tu attends un courrier automatique" },
          { letter: "C", text: "Tu demandes au propriétaire" },
        ],
        explanation:
          "La simulation est gratuite et rapide — fais-la AVANT de signer pour connaître ton vrai budget.",
      },
      {
        category: "Les aides et le garant",
        prompt: "Un garant, c'est :",
        options: [
          { letter: "A", text: "Quelqu'un qui s'engage à payer si tu ne peux plus", correct: true },
          { letter: "B", text: "L'agent immobilier" },
          { letter: "C", text: "Un assureur obligatoire" },
        ],
        explanation:
          "Souvent un parent. Il signe un « acte de cautionnement » — engagement sérieux, pas symbolique.",
      },
      {
        category: "Les aides et le garant",
        prompt: "Personne ne peut se porter garant pour toi. Une solution :",
        options: [
          { letter: "A", text: "La garantie Visale, gratuite pour les jeunes", correct: true },
          { letter: "B", text: "Impossible de louer sans garant" },
          { letter: "C", text: "Payer 6 mois de loyer d'avance (c'est la règle)" },
        ],
        explanation:
          "Visale (Action Logement) se porte garant gratuitement pour les moins de 31 ans. Demande sur visale.fr.",
      },
    ],
  },
  voiture: {
    title: "Rouler en règle",
    screens: [
      {
        title: "Le permis probatoire",
        body: "Jeune permis, tu démarres avec 6 points (pas 12). Tu gagnes les autres au fil des années sans infraction. Les règles sont aussi plus strictes : la limite d'alcool est de 0,2 g/L, soit zéro verre en pratique.",
      },
      {
        title: "L'assurance auto",
        body: "Assurer sa voiture est obligatoire. Le minimum légal est l'assurance « au tiers » : elle couvre les dégâts que TU causes aux autres. La « tous risques » couvre aussi ta propre voiture. La franchise, c'est la somme qui reste à ta charge après un sinistre. Le bonus-malus fait monter ou baisser ta cotisation selon tes accidents responsables.",
        tip: "Bon réflexe : rouler sans assurance est un délit — grosse amende et véhicule immobilisable.",
      },
      {
        title: "Les documents du véhicule",
        body: "Carte grise (certificat d'immatriculation) : la « carte d'identité » de la voiture. Si tu achètes une occasion, tu as 1 mois pour la mettre à ton nom, en ligne sur le site de l'ANTS. Contrôle technique : premier passage à 4 ans, puis tous les 2 ans.",
      },
      {
        title: "Ce qu'il faut retenir",
        body: "Pour rouler en règle, trois choses à jour : permis valide, assurance active, carte grise à ton nom avec contrôle technique OK. Un seul manquant, et tu risques amende, immobilisation, et zéro couverture en cas d'accident.",
      },
    ],
    questions: [
      {
        category: "Le permis probatoire",
        prompt: "Jeune permis (période probatoire) : tu démarres avec :",
        options: [
          { letter: "A", text: "6 points", correct: true },
          { letter: "B", text: "12 points" },
          { letter: "C", text: "0 point" },
        ],
        explanation:
          "Le capital complet de 12 points s'acquiert progressivement, si tu ne commets pas d'infraction.",
      },
      {
        category: "Le permis probatoire",
        prompt: "Alcool au volant en permis probatoire : la limite est :",
        options: [
          { letter: "A", text: "0,2 g/L, soit zéro verre en pratique", correct: true },
          { letter: "B", text: "0,5 g/L comme tout le monde" },
          { letter: "C", text: "Il n'y a pas de limite précise" },
        ],
        explanation: "0,2 g/L est atteint dès le premier verre — en probatoire, c'est zéro alcool.",
      },
      {
        category: "L'assurance auto",
        prompt: "L'assurance minimum obligatoire pour rouler, c'est :",
        options: [
          { letter: "A", text: "L'assurance « au tiers » (responsabilité civile)", correct: true },
          { letter: "B", text: "L'assurance tous risques" },
          { letter: "C", text: "Aucune si la voiture est ancienne" },
        ],
        explanation: "Le tiers couvre les dégâts causés aux autres. La tous risques est un plus, pas une obligation.",
      },
      {
        category: "Les documents du véhicule",
        prompt: "Tu achètes une voiture d'occasion. La carte grise à ton nom :",
        options: [
          { letter: "A", text: "Sous 1 mois, en ligne (ANTS)", correct: true },
          { letter: "B", text: "Sous 1 an" },
          { letter: "C", text: "Ce n'est pas obligatoire" },
        ],
        explanation: "Passé 1 mois, tu risques une amende. La démarche se fait entièrement en ligne.",
      },
      {
        category: "Les documents du véhicule",
        prompt: "Le premier contrôle technique d'une voiture neuve, c'est :",
        options: [
          { letter: "A", text: "À 4 ans, puis tous les 2 ans", correct: true },
          { letter: "B", text: "Tous les ans dès l'achat" },
          { letter: "C", text: "Jamais si elle est bien entretenue" },
        ],
        explanation:
          "4 ans après la première mise en circulation, puis tous les 2 ans, quel que soit l'entretien.",
      },
      {
        category: "L'assurance auto",
        prompt: "Le bonus-malus, c'est :",
        options: [
          { letter: "A", text: "Ta cotisation baisse ou monte selon tes accidents responsables", correct: true },
          { letter: "B", text: "Un jeu-concours de l'assureur" },
          { letter: "C", text: "Une amende de la préfecture" },
        ],
        explanation:
          "Chaque année sans accident responsable fait baisser ta cotisation ; un accident la fait grimper.",
      },
      {
        category: "L'assurance auto",
        prompt: "La franchise de ton assurance auto, c'est :",
        options: [
          { letter: "A", text: "La somme qui reste à ta charge après un sinistre", correct: true },
          { letter: "B", text: "Le prix mensuel de l'assurance" },
          { letter: "C", text: "Une réduction jeune conducteur" },
        ],
        explanation: "Réparation à 800 €, franchise de 300 € → l'assurance paie 500 €, toi 300 €.",
      },
      {
        category: "L'assurance auto",
        prompt: "Rouler sans assurance, c'est :",
        options: [
          { letter: "A", text: "Un délit : grosse amende, véhicule immobilisable", correct: true },
          { letter: "B", text: "Un simple avertissement" },
          { letter: "C", text: "Toléré les 6 premiers mois" },
        ],
        explanation:
          "Et en cas d'accident responsable, tu rembourses TOUS les dégâts de ta poche, parfois à vie.",
      },
    ],
  },
};
