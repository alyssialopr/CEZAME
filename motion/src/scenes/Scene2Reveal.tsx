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
import { theme } from "../theme";
import { CezameLogo } from "../components/CezameLogo";
import {
  Entrance,
  HandUnderline,
  SceneExit,
  ThreeTraitsBurst,
  WordReveal,
} from "../components/MotionPrimitives";

export const Scene2Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ricoPop = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: theme.spring.bouncy,
  });
  const logoPop = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: theme.spring.bouncy,
  });
  const breathe = 1 + Math.sin(frame / 18) * 0.015;

  return (
    <SceneExit>
      <AbsoluteFill
        style={{
          padding: "220px 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: -26,
                right: -12,
                zIndex: 4,
              }}
            >
              <ThreeTraitsBurst delay={6} scale={1.15} rotateDeg={12} />
            </div>

            <div
              style={{
                width: 260,
                height: 260,
                transform: `scale(${ricoPop * breathe})`,
                opacity: ricoPop,
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
                zIndex: 2,
              }}
            >
              <Img
                src={staticFile("assets/emotions/RicoEntreprise_Surprised.png")}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>

          <div
            style={{
              transform: `scale(${logoPop * breathe}) translateY(${interpolate(
                logoPop,
                [0, 1],
                [30, 0]
              )}px)`,
              opacity: logoPop,
              zIndex: 2,
            }}
          >
            <CezameLogo variant="wordmark-white" width={540} />
          </div>
        </div>

        <WordReveal
          text="Le Duolingo de la vie adulte"
          highlight={["Duolingo"]}
          highlightColor={theme.colors.lime}
          delay={14}
          per={4}
          style={{
            fontFamily: theme.fonts.display,
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.08,
            color: theme.colors.text,
          }}
        />

        <Entrance delay={28}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                color: theme.colors.lime,
                fontFamily: theme.fonts.display,
                fontSize: 38,
                fontWeight: 700,
              }}
            >
              100% Gratuit • 3 min par jour
            </div>
            <HandUnderline width={240} color={theme.colors.lime} delay={32} />
          </div>
        </Entrance>
      </AbsoluteFill>
    </SceneExit>
  );
};
