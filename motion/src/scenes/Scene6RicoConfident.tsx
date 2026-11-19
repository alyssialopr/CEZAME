import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CheckCircle2 } from "lucide-react";
import { theme } from "../theme";
import {
  Entrance,
  HandUnderline,
  SceneExit,
  SparkRays,
  ThreeTraitsBurst,
  WordReveal,
} from "../components/MotionPrimitives";

const CHECK_PILLS = [
  { label: "Impôts", x: -275, y: -155, delay: 8 },
  { label: "Logement", x: 275, y: -130, delay: 13 },
  { label: "Budget", x: -250, y: 165, delay: 18 },
  { label: "Santé", x: 265, y: 170, delay: 23 },
];

export const Scene6RicoConfident: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ricoPop = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: theme.spring.bouncy,
  });
  const floatY = Math.sin(frame / 14) * 8;

  return (
    <SceneExit>
      <AbsoluteFill
        style={{
          padding: "215px 64px 230px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "center",
        }}
      >
        <Entrance delay={0}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontSize: 44,
                fontWeight: 700,
                color: theme.colors.accent,
              }}
            >
              Mission accomplie !
            </div>
            <HandUnderline width={220} color={theme.colors.accent} delay={6} />
          </div>
        </Entrance>

        <div
          style={{
            position: "relative",
            width: 760,
            height: 520,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute" }}>
            <SparkRays size={480} delay={4} rays={12} color={theme.colors.lime} />
          </div>

          {CHECK_PILLS.map((pill) => {
            const p = spring({
              frame: Math.max(0, frame - pill.delay),
              fps,
              config: theme.spring.snappy,
            });
            return (
              <div
                key={pill.label}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  opacity: frame < pill.delay ? 0 : p,
                  transform: `translate(-50%, -50%) translate(${pill.x * p}px, ${
                    pill.y * p
                  }px) scale(${interpolate(p, [0, 1], [0.75, 1])})`,
                  background: theme.colors.lime,
                  color: theme.colors.ink,
                  padding: "14px 22px",
                  borderRadius: 99,
                  boxShadow: "0 16px 36px rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  zIndex: 4,
                }}
              >
                <CheckCircle2 size={24} color="#2F6A0D" strokeWidth={2.8} />
                <span
                  style={{
                    fontFamily: theme.fonts.display,
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {pill.label}
                </span>
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              top: 25,
              right: 170,
              zIndex: 5,
            }}
          >
            <ThreeTraitsBurst delay={8} scale={1.3} rotateDeg={14} />
          </div>

          <div
            style={{
              width: 390,
              height: 390,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${ricoPop}) translateY(${floatY}px)`,
              filter: `drop-shadow(0 24px 50px rgba(0,0,0,0.5))`,
              zIndex: 2,
            }}
          >
            <Img
              src={staticFile("assets/emotions/RicoEntreprise_Proud.png")}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>

        <WordReveal
          text="Prêt à vivre ta vie pleinement !"
          highlight={["pleinement"]}
          highlightColor={theme.colors.lime}
          delay={8}
          per={3}
          style={{
            fontFamily: theme.fonts.display,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.06,
            color: theme.colors.text,
          }}
        />
      </AbsoluteFill>
    </SceneExit>
  );
};
