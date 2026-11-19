import React from "react";
import { theme } from "../theme";

export const PhoneMockup: React.FC<{
  children: React.ReactNode;
  scale?: number;
  rotateDeg?: number;
  tiltYDeg?: number;
}> = ({ children, scale = 1, rotateDeg = 0, tiltYDeg = 0 }) => {
  return (
    <div
      style={{
        width: 520,
        height: 1050,
        borderRadius: 68,
        padding: 16,
        background: "linear-gradient(145deg, #2E2849 0%, #161226 100%)",
        boxShadow: `0 45px 100px -15px rgba(0,0,0,0.72), 0 0 60px ${theme.colors.glow}`,
        border: "2px solid rgba(255,255,255,0.18)",
        transform: `perspective(1200px) rotateY(${tiltYDeg}deg) scale(${scale}) rotate(${rotateDeg}deg)`,
        position: "relative",
      }}
    >
      {/* Dynamic Island */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: "50%",
          transform: "translateX(-50%)",
          width: 148,
          height: 36,
          borderRadius: 20,
          background: "#0B0914",
          zIndex: 20,
        }}
      />

      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 54,
          overflow: "hidden",
          background: theme.colors.surface,
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};
