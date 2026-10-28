import { Composition } from "remotion";
import { RedBullRingIntro } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RedBullRingIntro"
        component={RedBullRingIntro}
        durationInFrames={180}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
