import React from "react";
import { Img, staticFile } from "remotion";

export type CezameLogoVariant =
  | "wordmark-white"
  | "horizontal-white"
  | "vertical-white"
  | "horizontal-color-purple";

const VARIANT_SRC: Record<CezameLogoVariant, string> = {
  "wordmark-white": "assets/brand/cezame-wordmark-white.svg",
  "horizontal-white": "assets/brand/cezame-logo-horizontal-white.svg",
  "vertical-white": "assets/brand/cezame-logo-vertical-white.svg",
  "horizontal-color-purple": "assets/brand/cezame-logo-horizontal-color-purple.svg",
};

export const CezameLogo: React.FC<{
  variant?: CezameLogoVariant;
  width?: number;
}> = ({ variant = "horizontal-white", width = 520 }) => {
  // Respect brand/README.md clear space (~18% padding around logo)
  const padY = Math.round(width * 0.05);
  const padX = Math.round(width * 0.06);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `${padY}px ${padX}px`,
      }}
    >
      <Img
        src={staticFile(VARIANT_SRC[variant])}
        style={{
          width,
          height: "auto",
          objectFit: "contain",
          filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.35))",
        }}
      />
    </div>
  );
};
