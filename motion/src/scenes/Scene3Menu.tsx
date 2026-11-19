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
import { MenuScreen } from "../components/AppScreens";
import {
  DoodleArrow,
  HandUnderline,
  SceneExit,
  WordReveal,
} from "../components/MotionPrimitives";

export const Scene3Menu: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const phonePop = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: theme.spring.smooth,
  });
  const ricoPop = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: theme.spring.bouncy,
  });
  const floatY = Math.sin(frame / 14) * 5;
  const scale = interpolate(frame, [0, durationInFrames], [0.96, 1.01], {
    easing: theme.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tilt = interpolate(phonePop, [0, 1], [-4, 0]);
  const tiltY = interpolate(phonePop, [0, 1], [10, -3]);
  const tapBounce = interpolate(frame, [58, 61, 67], [1, 0.982, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
            text="Choisis ton thème"
            highlight={["thème"]}
            highlightColor={theme.colors.gold}
            delay={2}
            per={3}
            style={{
              fontFamily: theme.fonts.display,
              fontSize: 74,
              fontWeight: 700,
              color: theme.colors.text,
            }}
          />
          <HandUnderline width={220} color={theme.colors.gold} delay={12} />
        </div>

        <div
          style={{
            opacity: phonePop,
            transform: `translateY(${interpolate(phonePop, [0, 1], [65, 0])}px)`,
          }}
        >
          <PhoneMockup scale={scale * tapBounce} rotateDeg={tilt} tiltYDeg={tiltY}>
            <MenuScreen />
          </PhoneMockup>
        </div>

        {/* Doodle arrow from Rico toward phone */}
        <div
          style={{
            position: "absolute",
            left: 195,
            bottom: 340,
            zIndex: 11,
            pointerEvents: "none",
          }}
        >
          <DoodleArrow delay={20} color={theme.colors.gold} />
        </div>

        {/* Rico Thoughtful peeking beside phone */}
        <div
          style={{
            position: "absolute",
            left: 34,
            bottom: 185,
            width: 220,
            height: 220,
            opacity: frame < 14 ? 0 : ricoPop,
            transform: `scale(${ricoPop}) translateY(${floatY}px) rotate(-4deg)`,
            filter: "drop-shadow(0 18px 34px rgba(0,0,0,0.55))",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <Img
            src={staticFile("assets/emotions/RicoEntreprise_Thoughtful.png")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </AbsoluteFill>
    </SceneExit>
  );
};
