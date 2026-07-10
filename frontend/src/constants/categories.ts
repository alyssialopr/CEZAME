import { Car, Heart, Home, Landmark, PiggyBank } from "lucide-react-native";

export type Category = {
  id: string;
  label: string;
  subtitle: string;
  color: string;
  icon: typeof Heart;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mascot: any;
};

export const CATEGORIES: Category[] = [
  {
    id: "sante",
    label: "Santé",
    subtitle: "Prendre soin de toi",
    color: "#A8EA73",
    icon: Heart,
    mascot: require("@/images/RicoDocteur.svg"),
  },
  {
    id: "finance",
    label: "Finance",
    subtitle: "Maîtriser ses finances",
    color: "#FBE7A1",
    icon: PiggyBank,
    mascot: require("@/images/RicoEntrepriseDroit.svg"),
  },
  {
    id: "administration",
    label: "Administration",
    subtitle: "Simplifier tes démarches",
    color: "#8C9EFF",
    icon: Landmark,
    mascot: require("@/images/RicoEntreprise.svg"),
  },
  {
    id: "voiture",
    label: "Voiture",
    subtitle: "Rouler sereinement",
    color: "#9B6CFF",
    icon: Car,
    mascot: require("@/images/RicoBleuTravail.svg"),
  },
  {
    id: "logement",
    label: "Logement",
    subtitle: "Trouver ton toit",
    color: "#FFAB4A",
    icon: Home,
    mascot: require("@/images/Riconstruction.svg"),
  },
];
