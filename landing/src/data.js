import ricoDocteur from "./assets/rico-docteur.png";
import ricoEntreprise from "./assets/rico-entreprise.png";
import ricoEntrepriseDroit from "./assets/rico-entreprise-droit.png";
import ricoMecano from "./assets/rico-mecano.png";
import ricoConstruction from "./assets/rico-construction.png";

export const NAV_LINKS = [
  { label: "Les mondes", href: "#mondes" },
  { label: "Comment ça marche", href: "#comment" },
  { label: "Teste-toi", href: "#quiz" },
  { label: "Écoles", href: "#ecoles" },
];

export const TOPICS = [
  "Impôts",
  "Bail",
  "CAF",
  "Mutuelle",
  "Permis",
  "Banque",
  "APL",
  "Sécu",
  "Assurance",
  "Fiche de paie",
  "Caution",
  "Carte Vitale",
];

export const LOCKED = [
  "Remplir ma déclaration d’impôts",
  "Lire un bail avant de signer",
  "Demander les APL",
  "Choisir une mutuelle",
  "Ouvrir un compte en banque",
  "Assurer ma première voiture",
];

export const WORLDS = [
  { name: "Santé", sub: "Prendre soin de toi", bg: "#B5EB8A", border: "#8CCB5E", iconColor: "#9BD86C", icon: "cross", rico: ricoDocteur },
  {
    name: "Finance",
    sub: "Maîtriser ses finances",
    bg: "#FDE59A",
    border: "#E3C45A",
    iconColor: "#EFCF62",
    icon: "euro",
    rico: ricoEntrepriseDroit,
  },
  {
    name: "Administration",
    sub: "Simplifier tes démarches",
    bg: "#8FA8FB",
    border: "#6F86E8",
    iconColor: "#7891F0",
    icon: "doc",
    rico: ricoEntreprise,
  },
  { name: "Voiture", sub: "Rouler sereinement", bg: "#AE8CF7", border: "#8A6BE6", iconColor: "#9B78EE", icon: "car", rico: ricoMecano },
  {
    name: "Logement",
    sub: "Trouver ton chez-toi",
    bg: "#FFC79A",
    border: "#F0A464",
    iconColor: "#F8B57D",
    icon: "house",
    rico: ricoConstruction,
  },
];

export const QUIZ = {
  topic: "Obligation déclarative",
  question: "Doit-on faire sa déclaration d’impôts si l’on ne gagne rien ou seulement de très petits revenus ?",
  answers: [
    { id: "a", text: "Oui, déclarer est obligatoire et permet d’obtenir son avis d’imposition pour les aides", good: true },
    { id: "b", text: "Non, la déclaration est interdite si l’on gagne moins de 15 000 € par an", good: false },
    { id: "c", text: "Seules les personnes de plus de 40 ans sont obligées de déclarer", good: false },
  ],
  explanation:
    "Dès que tu fais ta propre déclaration, c’est chaque année, même sans revenus. L’avis d’imposition que tu reçois est demandé pour la CAF, une bourse ou un logement.",
};

export const FOOTER_COLUMNS = [
  { title: "L’app", links: ["Les mondes", "Comment ça marche", "Teste-toi"] },
  { title: "Cezame", links: ["Qui on est", "Écoles et assos", "Contact"] },
  { title: "Suivre", links: ["TikTok", "Instagram"] },
  { title: "Légal", links: ["Mentions légales", "Confidentialité"] },
];
