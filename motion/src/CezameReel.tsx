import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { loadFont as loadDynaPuff } from "@remotion/google-fonts/DynaPuff";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { BgMesh, Grade, Grain, Vignette } from "./components/MotionPrimitives";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene2Reveal } from "./scenes/Scene2Reveal";
import { Scene3Menu } from "./scenes/Scene3Menu";
import { Scene4Lesson } from "./scenes/Scene4Lesson";
import { Scene5EndScreen } from "./scenes/Scene5EndScreen";
import { Scene6RicoConfident } from "./scenes/Scene6RicoConfident";
import { Scene7Outro } from "./scenes/Scene7Outro";

loadDynaPuff();
loadJakarta();

const VOICEOVER_FILE =
  "sfx/ElevenLabs_2026-11-19T09_31_10_Audrey - Energetic Commercial_pvc_sp110_s45_sb75_se13_b_m2.mp3";

export const CezameReel: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Layer 1: Animated background mesh */}
      <BgMesh />

      {/* Voiceover (Audrey ElevenLabs) + ducked music bed + beat-synced UI SFX */}
      <Audio src={staticFile(VOICEOVER_FILE)} volume={1.0} />
      <Audio src={staticFile("sfx/music.wav")} volume={0.11} />
      <Sequence from={6}>
        <Audio src={staticFile("sfx/uhoh.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={193}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={325}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={388}>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.45} />
      </Sequence>
      <Sequence from={433}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={484}>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.48} />
      </Sequence>
      <Sequence from={535}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={544}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.38} />
      </Sequence>
      <Sequence from={608}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.32} />
      </Sequence>
      <Sequence from={685}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} />
      </Sequence>

      {/* Layer 2 & 3: Scenes synced to Audrey voiceover pauses (30 fps) */}
      <Sequence from={0} durationInFrames={196}>
        <Scene1Problem />
      </Sequence>
      <Sequence from={196} durationInFrames={132}>
        <Scene2Reveal />
      </Sequence>
      <Sequence from={328} durationInFrames={108}>
        <Scene3Menu />
      </Sequence>
      <Sequence from={436} durationInFrames={102}>
        <Scene4Lesson />
      </Sequence>
      <Sequence from={538} durationInFrames={73}>
        <Scene5EndScreen />
      </Sequence>
      <Sequence from={611} durationInFrames={77}>
        <Scene6RicoConfident />
      </Sequence>
      <Sequence from={688} durationInFrames={212}>
        <Scene7Outro />
      </Sequence>

      {/* Layer 4 & 5: Color grade, procedural grain, vignette */}
      <Grade />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};
