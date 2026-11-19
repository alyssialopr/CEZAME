import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { PhoneMockup } from "../components/PhoneMockup";
import { EndScreen } from "../components/AppScreens";
import {
  ConfettiBurst,
  HandUnderline,
  SceneExit,
  WordReveal,
} from "../components/MotionPrimitives";

export const Scene5EndScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const phonePop = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: theme.spring.smooth,
  });
  const scale = interpolate(frame, [0, durationInFrames], [1.03, 0.99], {
    easing: theme.ease.inOut,
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
            text="Gagne tes badges !"
            highlight={["badges"]}
            highlightColor={theme.colors.lime}
            delay={2}
            per={3}
            style={{
              fontFamily: theme.fonts.display,
              fontSize: 74,
              fontWeight: 700,
              color: theme.colors.text,
            }}
          />
          <HandUnderline width={230} color={theme.colors.lime} delay={12} />
        </div>

        <div
          style={{
            opacity: phonePop,
            transform: `translateY(${interpolate(phonePop, [0, 1], [45, 0])}px)`,
          }}
        >
          <PhoneMockup scale={scale}>
            <EndScreen />
          </PhoneMockup>
        </div>

        <ConfettiBurst delay={10} />
      </AbsoluteFill>
    </SceneExit>
  );
};
