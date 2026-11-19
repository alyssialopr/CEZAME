import React from "react";
import { Composition } from "remotion";
import { CezameReel } from "./CezameReel";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CezameReel"
      component={CezameReel}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
