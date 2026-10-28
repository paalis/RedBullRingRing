import { Composition } from "remotion";
import { RedBullRingIntro } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RedBullRingIntro"
        component={RedBullRingIntro}
        durationInFrames={1563}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RedBullRingIntroMobile"
        component={RedBullRingIntro}
        durationInFrames={1563}
        fps={30}
        width={720}
        height={1280}
      />
    </>
  );
};
