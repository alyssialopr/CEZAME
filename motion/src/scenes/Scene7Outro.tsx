import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ArrowUpRight } from "lucide-react";
import { theme } from "../theme";
import { CezameLogo } from "../components/CezameLogo";
import { QrCodeCard } from "../components/QrCodeCard";
import { Entrance, WordReveal } from "../components/MotionPrimitives";

export const Scene7Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const qrPop = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: theme.spring.bouncy,
  });
  const breathe = 1 + Math.sin(frame / 22) * 0.012;

  return (
    <AbsoluteFill
      style={{
        padding: "210px 64px 220px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "center",
      }}
    >
      {/* Header: Official CEZAME Horizontal White Lockup */}
      <Entrance delay={0}>
        <CezameLogo variant="horizontal-white" width={540} />
      </Entrance>

      {/* QR Code + Mobile CTA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            opacity: qrPop,
            transform: `scale(${qrPop * breathe}) translateY(${interpolate(
              qrPop,
              [0, 1],
              [30, 0]
            )}px)`,
          }}
        >
          <QrCodeCard url="https://cezame-frontend.vercel.app" size={300} />
        </div>

        <Entrance delay={16}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 28px",
              borderRadius: 99,
              background: "rgba(255,255,255,0.1)",
              border: "2px solid rgba(255,255,255,0.22)",
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <span>cezame-frontend.vercel.app</span>
            <ArrowUpRight size={26} color={theme.colors.gold} />
          </div>
        </Entrance>

        <Entrance delay={22}>
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 28,
              fontWeight: 700,
              color: theme.colors.lime,
            }}
          >
            Lien en bio • 100% Gratuit
          </div>
        </Entrance>
      </div>

      {/* Slogan */}
      <WordReveal
        text="« L’application qui t’ouvre les portes de la vie adulte »"
        highlight={["portes", "vie", "adulte"]}
        highlightColor={theme.colors.gold}
        delay={18}
        per={3}
        style={{
          fontFamily: theme.fonts.display,
          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.14,
          color: theme.colors.text,
        }}
      />
    </AbsoluteFill>
  );
};
