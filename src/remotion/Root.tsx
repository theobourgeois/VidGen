import React from "react";
import { Composition } from "remotion";
import { VidGenComposition } from "./composition/composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Empty"
        component={VidGenComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
