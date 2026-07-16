import { Car, Home, Euro, FileText, Plus } from "lucide-react-native";

export type Category = {
  id: string;
  label: string;
  subtitle: string;
  color: string;
  borderColor?: string;
  icon: typeof Home;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mascot: any;
};

export const CATEGORIES: Category[] = [
  {
    id: "sante",
    label: "Santé",
    subtitle: "Prendre soin de toi",
    color: "#B4EE83", // Adjusted to match mockup
    borderColor: "#91C85A",
    icon: Plus,
    mascot: require("@/images/RicoDocteur.svg"),
  },
  {
    id: "finance",
    label: "Finance",
    subtitle: "Maîtriser ses finances",
    color: "#FDE694",
    borderColor: "#DBBA3E",
    icon: Euro,
    mascot: require("@/images/RicoEntrepriseDroit.svg"),
  },
  {
    id: "administration",
    label: "Administration",
    subtitle: "Simplifier tes démarches",
    color: "#8FA6FF",
    borderColor: "#607FE8",
    icon: FileText,
    mascot: require("@/images/RicoEntreprise.svg"),
  },
  {
    id: "voiture",
    label: "Voiture",
    subtitle: "Rouler sereinement",
    color: "#AC84FF",
    borderColor: "#8854E8",
    icon: Car,
    mascot: require("@/images/RicoBleuTravail.svg"),
  },
  {
    id: "logement",
    label: "Logement",
    subtitle: "Trouver ton toit",
    color: "#FFB55F",
    borderColor: "#E88D23",
    icon: Home,
    mascot: require("@/images/Riconstruction.svg"),
  },
];
