import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";

export const BgMesh: React.FC<{ variant?: "dark" | "warm" }> = ({
  variant = "dark",
}) => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 55) * 55;
  const d2 = Math.cos(frame / 70) * 45;

  const base = variant === "dark" ? theme.colors.bg : "#141024";

  return (
    <AbsoluteFill style={{ background: base, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          top: -380,
          left: -260 + d1,
          filter: "blur(60px)",
          background: `radial-gradient(circle, ${theme.colors.primary}38, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 860,
          height: 860,
          borderRadius: "50%",
          bottom: -320,
          right: -220 - d2,
          filter: "blur(75px)",
          background: `radial-gradient(circle, ${theme.colors.cyan}26, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: "50%",
          top: "42%",
          left: "52%",
          transform: `translate(-50%, -50%) translateY(${d2 * 0.6}px)`,
          filter: "blur(80px)",
          background: `radial-gradient(circle, ${theme.colors.coral}16, transparent 68%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.primary,
        mixBlendMode: "soft-light",
        opacity: 0.14,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.12), transparent 26%, transparent 74%, rgba(0,0,0,0.24))",
      }}
    />
  </AbsoluteFill>
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.045,
        mixBlendMode: "overlay",
      }}
    />
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, transparent 58%, rgba(6,4,14,0.34) 100%)",
    }}
  />
);

export const Entrance: React.FC<{
  delay?: number;
  yOffset?: number;
  scaleFrom?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, yOffset = 36, scaleFrom = 0.94, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: theme.spring.smooth,
  });
  const opacity = frame < delay ? 0 : p;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${interpolate(p, [0, 1], [yOffset, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}px) scale(${interpolate(p, [0, 1], [scaleFrom, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const WordReveal: React.FC<{
  text: string;
  highlight?: string[];
  highlightColor?: string;
  delay?: number;
  per?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  highlight = [],
  highlightColor = theme.colors.primary,
  delay = 0,
  per = 3,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "12px 18px",
        ...style,
      }}
    >
      {words.map((word, i) => {
        const start = delay + i * per;
        const p = spring({
          frame: Math.max(0, frame - start),
          fps,
          config: theme.spring.snappy,
        });
        const visible = frame >= start ? p : 0;
        const clean = word.replace(/[.,!?…«»]/g, "").toLowerCase();
        const isHi = highlight.some((h) => h.toLowerCase() === clean);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: visible,
              color: isHi ? highlightColor : undefined,
              textShadow: isHi ? `0 0 36px ${highlightColor}66` : undefined,
              transform: `translateY(${interpolate(p, [0, 1], [28, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}px) scale(${interpolate(p, [0, 1], [0.92, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })})`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const SparkRays: React.FC<{
  size?: number;
  delay?: number;
  rays?: number;
  color?: string;
}> = ({ size = 220, delay = 0, rays = 12, color = theme.colors.primary }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: rays }).map((_, i) => {
        const start = delay + i * 1.2;
        const p = spring({
          frame: Math.max(0, frame - start),
          fps,
          config: theme.spring.snappy,
        });
        const h = size * 0.22 * (frame >= start ? p : 0);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: Math.max(4, size * 0.032),
              height: h,
              background: color,
              opacity: 0.65,
              borderRadius: size,
              transformOrigin: "50% 0%",
              transform: `translateX(-50%) rotate(${(360 / rays) * i}deg) translateY(${size * 0.32}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

export const ConfettiBurst: React.FC<{ delay?: number }> = ({ delay = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = [
    theme.colors.primary,
    theme.colors.lime,
    theme.colors.cyan,
    theme.colors.coral,
    theme.colors.gold,
  ];
  const pieces = 28;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: pieces }).map((_, i) => {
        const angle = (i / pieces) * Math.PI * 2 + (i % 3) * 0.17;
        const dist = 160 + (i % 5) * 95;
        const p = spring({
          frame: Math.max(0, frame - delay - (i % 4)),
          fps,
          config: { damping: 16, stiffness: 80, mass: 0.7 },
        });
        const gravity = Math.max(0, frame - delay) * 2.2;
        const x = 540 + Math.cos(angle) * dist * p;
        const y = 780 + Math.sin(angle) * dist * p + gravity * 1.3;
        const opacity = interpolate(
          frame - delay,
          [0, 6, 48, 70],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const rot = (frame - delay) * (i % 2 === 0 ? 7 : -6);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: i % 3 === 0 ? 16 : 12,
              height: i % 2 === 0 ? 16 : 24,
              borderRadius: i % 3 === 0 ? "50%" : 4,
              background: colors[i % colors.length],
              opacity,
              transform: `translate(-50%, -50%) rotate(${rot}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const SceneExit: React.FC<{
  exitDuration?: number;
  children: React.ReactNode;
}> = ({ exitDuration = 10, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const start = durationInFrames - exitDuration;
  const exitO = interpolate(frame, [start, durationInFrames - 1], [1, 0], {
    easing: theme.ease.in,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = interpolate(frame, [start, durationInFrames - 1], [0, -28], {
    easing: theme.ease.in,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: exitO,
        transform: `translateY(${exitY}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const HandUnderline: React.FC<{
  width?: number;
  color?: string;
  delay?: number;
}> = ({ width = 260, color = theme.colors.gold, delay = 14 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + 16], [0, 1], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const len = 320;
  return (
    <svg
      width={width}
      height={22}
      viewBox="0 0 280 22"
      fill="none"
      style={{ overflow: "visible", marginTop: -6 }}
    >
      <path
        d="M6 15 C 75 5, 195 4, 274 13"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - progress)}
      />
    </svg>
  );
};

export const ThreeTraitsBurst: React.FC<{
  delay?: number;
  scale?: number;
  rotateDeg?: number;
}> = ({ delay = 6, scale = 1, rotateDeg = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const traits = [
    { color: "#855AE7", x: -24, y: -12, rot: -28, d: 0 },
    { color: "#92DCE2", x: 6, y: -22, rot: 2, d: 2 },
    { color: "#F5A6A2", x: 32, y: -6, rot: 34, d: 4 },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: 72,
        height: 48,
        transform: `scale(${scale}) rotate(${rotateDeg}deg)`,
        pointerEvents: "none",
      }}
    >
      {traits.map((t, i) => {
        const p = spring({
          frame: Math.max(0, frame - (delay + t.d)),
          fps,
          config: theme.spring.bouncy,
        });
        const opacity = frame < delay + t.d ? 0 : p;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              width: 10,
              height: 30 * p,
              borderRadius: 99,
              background: t.color,
              opacity,
              transform: `translate(${t.x}px, ${t.y * p}px) rotate(${t.rot}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

export const DoodleArrow: React.FC<{
  delay?: number;
  color?: string;
  flip?: boolean;
}> = ({ delay = 18, color = theme.colors.gold, flip = false }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + 18], [0, 1], {
    easing: theme.ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const len = 180;
  return (
    <svg
      width={96}
      height={64}
      viewBox="0 0 96 64"
      fill="none"
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
        opacity: frame < delay ? 0 : 1,
      }}
    >
      <path
        d="M8 52 C 26 20, 56 14, 84 22"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - progress)}
      />
      {progress > 0.7 && (
        <path
          d="M72 12 L86 22 L73 33"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};
