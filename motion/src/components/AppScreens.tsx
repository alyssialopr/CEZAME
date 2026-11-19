import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sparkles } from "lucide-react";
import { theme } from "../theme";

const TapCursor: React.FC<{ x: number; y: number; tapFrame: number }> = ({
  x,
  y,
  tapFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: Math.max(0, frame - (tapFrame - 18)),
    fps,
    config: theme.spring.snappy,
  });
  const press = interpolate(
    frame,
    [tapFrame - 3, tapFrame, tapFrame + 6],
    [1, 0.82, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ripple = interpolate(frame, [tapFrame, tapFrame + 16], [0, 1], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [tapFrame + 14, tapFrame + 24], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < tapFrame - 18 || frame > tapFrame + 26) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 30,
        opacity: appear * fadeOut,
      }}
    >
      {frame >= tapFrame && (
        <div
          style={{
            position: "absolute",
            width: 84,
            height: 84,
            borderRadius: "50%",
            border: `4px solid ${theme.colors.primary}`,
            transform: `translate(-50%, -50%) scale(${0.4 + ripple * 1.1})`,
            opacity: 1 - ripple,
          }}
        />
      )}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: "rgba(139, 92, 246, 0.32)",
          border: `3px solid ${theme.colors.primary}`,
          boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
          transform: `translate(-50%, -50%) scale(${press})`,
        }}
      />
    </div>
  );
};

const RealScreenFrame: React.FC<{
  src: string;
  zoomFrom?: number;
  zoomTo?: number;
  children?: React.ReactNode;
}> = ({ src, zoomFrom = 1.0, zoomTo = 1.04, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
    easing: theme.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#FFFFFF",
        paddingTop: 58, // clear Dynamic Island cleanly
        paddingBottom: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `scale(${scale})`,
        }}
      />
      {children}
    </div>
  );
};

export const MenuScreen: React.FC = () => {
  const tapFrame = 60;
  // "Administration" card sits right around the middle of the cropped menu screen
  return (
    <RealScreenFrame src="assets/screens/menu_mobile.png" zoomFrom={1.0} zoomTo={1.04}>
      <TapCursor x={255} y={505} tapFrame={tapFrame} />
    </RealScreenFrame>
  );
};

export const LessonScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tapFrame = 48;

  const xpPop = spring({
    frame: Math.max(0, frame - (tapFrame + 4)),
    fps,
    config: theme.spring.bouncy,
  });

  return (
    <RealScreenFrame src="assets/screens/lesson_mobile.png" zoomFrom={1.03} zoomTo={1.0}>
      {/* Choice A (correct answer) highlight pill */}
      {frame >= tapFrame + 2 && (
        <div
          style={{
            position: "absolute",
            left: 26,
            right: 26,
            top: 365,
            height: 112,
            borderRadius: 22,
            border: "4px solid #6BA832",
            background: "rgba(180, 238, 131, 0.22)",
            pointerEvents: "none",
          }}
        />
      )}

      {frame >= tapFrame + 4 && (
        <div
          style={{
            position: "absolute",
            bottom: 115,
            left: "50%",
            padding: "12px 26px",
            borderRadius: 99,
            background: theme.colors.primary,
            color: "#FFFFFF",
            fontFamily: theme.fonts.display,
            fontSize: 22,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
            transform: `translateX(-50%) scale(${xpPop})`,
            boxShadow: `0 12px 28px ${theme.colors.glow}`,
            whiteSpace: "nowrap",
          }}
        >
          <Sparkles size={20} color={theme.colors.gold} />
          <span>Bonne réponse !</span>
        </div>
      )}

      <TapCursor x={245} y={422} tapFrame={tapFrame} />
    </RealScreenFrame>
  );
};

export const EndScreen: React.FC = () => {
  return (
    <RealScreenFrame src="assets/screens/end_mobile.png" zoomFrom={1.0} zoomTo={1.04} />
  );
};
