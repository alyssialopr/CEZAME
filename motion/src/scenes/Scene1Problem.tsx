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
import { FileWarning } from "lucide-react";
import { theme } from "../theme";
import {
  Entrance,
  HandUnderline,
  SceneExit,
  WordReveal,
} from "../components/MotionPrimitives";

const PAPER_CARDS = [
  { title: "Impôts", x: -290, y: -150, rot: -11, delay: 6 },
  { title: "Bail & APL", x: 275, y: -120, rot: 9, delay: 11 },
  { title: "Mutuelle", x: -265, y: 155, rot: 8, delay: 16 },
  { title: "Carte grise", x: 265, y: 170, rot: -8, delay: 21 },
];

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const ricoEntrance = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: theme.spring.bouncy,
  });
  const kenBurns = interpolate(frame, [0, durationInFrames], [1, 1.07], {
    easing: theme.ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Mild nervous wobble on Rico during the problem hook
  const wobble = Math.sin(frame * 0.45) * 3.2;

  return (
    <SceneExit>
      <AbsoluteFill
        style={{
          padding: "210px 64px 230px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Human Conversational Opener (no AI pill badge) */}
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
                fontSize: 42,
                fontWeight: 700,
                color: theme.colors.coral,
                letterSpacing: "0.01em",
              }}
            >
              La galère de la vie d’adulte…
            </div>
            <HandUnderline width={260} color={theme.colors.coral} delay={6} />
          </div>
        </Entrance>

        {/* Center Stage: Rico + swirling admin papers */}
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
          {/* Floating Admin Paper Cards */}
          {PAPER_CARDS.map((card) => {
            const p = spring({
              frame: Math.max(0, frame - card.delay),
              fps,
              config: theme.spring.snappy,
            });
            const floatY = Math.sin((frame + card.delay * 3) / 14) * 10;
            return (
              <div
                key={card.title}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  opacity: frame < card.delay ? 0 : p,
                  transform: `translate(-50%, -50%) translate(${card.x * p}px, ${
                    card.y * p + floatY
                  }px) rotate(${card.rot}deg) scale(${interpolate(p, [0, 1], [0.7, 1])})`,
                  background: "#FAF7F2",
                  color: theme.colors.ink,
                  padding: "16px 24px",
                  borderRadius: 20,
                  boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
                  border: `3px solid ${theme.colors.coral}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  zIndex: 4,
                }}
              >
                <FileWarning size={24} color="#D94E3B" strokeWidth={2.5} />
                <span
                  style={{
                    fontFamily: theme.fonts.display,
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {card.title}
                </span>
              </div>
            );
          })}

          {/* Rico Mascot (Worried emotion PNG) */}
          <div
            style={{
              width: 390,
              height: 390,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: `drop-shadow(0 28px 50px rgba(0,0,0,0.6)) drop-shadow(0 0 36px ${theme.colors.glow})`,
              transform: `scale(${ricoEntrance}) rotate(${wobble}deg)`,
              zIndex: 2,
            }}
          >
            <Img
              src={staticFile("assets/emotions/RicoEntreprise_Worried.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `scale(${kenBurns})`,
              }}
            />
          </div>
        </div>

        {/* Headline + Subline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            textAlign: "center",
          }}
        >
          <WordReveal
            text="1 jeune sur 2 redoute les démarches"
            highlight={["1", "jeune", "sur", "2"]}
            highlightColor={theme.colors.coral}
            delay={10}
            per={3}
            style={{
              fontFamily: theme.fonts.display,
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 1.06,
              color: theme.colors.text,
            }}
          />

          <Entrance delay={32}>
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontSize: 34,
                fontWeight: 500,
                color: theme.colors.textDim,
              }}
            >
              Personne ne t'a appris ça à l'école…
            </div>
          </Entrance>
        </div>
      </AbsoluteFill>
    </SceneExit>
  );
};
