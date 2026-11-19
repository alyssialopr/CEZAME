import { Easing } from "remotion";

export const theme = {
  colors: {
    bg: "#0E0B1A",
    bgAlt: "#17122B",
    primary: "#8B5CF6", // Rico violet (hero color — max 1 glowing element per frame)
    primaryDeep: "#6D28D9",
    accent: "#34D399", // Fresh mint/lime
    cyan: "#67E8F9",
    coral: "#FF8B7B",
    gold: "#FDE694",
    blue: "#8FA6FF",
    orange: "#FFB55F",
    lime: "#B4EE83",
    surface: "#FAF7F2",
    surfaceCard: "#FFFFFF",
    ink: "#161224",
    inkDim: "#5B5572",
    text: "#FAF8FF",
    textDim: "#B6AFD1",
    glow: "rgba(139, 92, 246, 0.45)",
  },
  fonts: {
    display: "DynaPuff",
    body: "Plus Jakarta Sans",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 170, mass: 0.6 },
    smooth: { damping: 20, stiffness: 95, mass: 1 },
    bouncy: { damping: 11, stiffness: 175, mass: 0.7 },
  },
} as const;
