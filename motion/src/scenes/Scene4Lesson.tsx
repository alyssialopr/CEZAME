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
import { PhoneMockup } from "../components/PhoneMockup";
import { LessonScreen } from "../components/AppScreens";
import {
  HandUnderline,
  SceneExit,
  ThreeTraitsBurst,
  WordReveal,
} from "../components/MotionPrimitives";

export const Scene4Lesson: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const phonePop = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: theme.spring.smooth,
  });
  const isAnswered = frame >= 50;
  const ricoReact = spring({
    frame: Math.max(0, frame - (isAnswered ? 50 : 8)),
    fps,
    config: theme.spring.bouncy,
  });
  const floatY = Math.sin(frame / 14) * 5;
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.04], {
    easing: theme.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tapBounce = interpolate(frame, [46, 49, 55], [1, 0.982, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tiltY = interpolate(phonePop, [0, 1], [-8, 3]);

  return (
    <SceneExit>
      <AbsoluteFill
        style={{
          padding: "180px 56px 190px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            textAlign: "center",
          }}
        >
          <WordReveal
            text="Des quiz simples & rapides"
            highlight={["simples"]}
            highlightColor={theme.colors.cyan}
            delay={2}
            per={3}
            style={{
              fontFamily: theme.fonts.display,
              fontSize: 70,
              fontWeight: 700,
              color: theme.colors.text,
            }}
          />
          <HandUnderline width={240} color={theme.colors.cyan} delay={12} />
        </div>

        <div
          style={{
            opacity: phonePop,
            transform: `translateY(${interpolate(phonePop, [0, 1], [50, 0])}px)`,
          }}
        >
          <PhoneMockup scale={scale * tapBounce} tiltYDeg={tiltY}>
            <LessonScreen />
          </PhoneMockup>
        </div>

        {/* Rico reacting: Thoughtful -> Warm + ThreeTraitsBurst when answered */}
        {isAnswered && (
          <div
            style={{
              position: "absolute",
              right: 52,
              bottom: 405,
              zIndex: 11,
              pointerEvents: "none",
            }}
          >
            <ThreeTraitsBurst delay={50} scale={1.1} rotateDeg={10} />
          </div>
        )}

        {/* Rico reacting: Thoughtful -> Warm when answered */}
        <div
          style={{
            position: "absolute",
            right: 34,
            bottom: 185,
            width: 225,
            height: 225,
            opacity: frame < 8 ? 0 : ricoReact,
            transform: `scale(${ricoReact}) translateY(${floatY}px) rotate(4deg)`,
            filter: "drop-shadow(0 18px 34px rgba(0,0,0,0.55))",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <Img
            src={staticFile(
              isAnswered
                ? "assets/emotions/RicoEntreprise_Warm.png"
                : "assets/emotions/RicoEntreprise_Thoughtful.png"
            )}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </AbsoluteFill>
    </SceneExit>
  );
};
