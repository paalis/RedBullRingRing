import { Composition } from "remotion";
import { Intro } from "./Intro";
import { DURATION, FPS } from "./timeline";

// To utgaver: liggende for PC og stående for mobil (renderes med --scale=2 til 720×1280).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Intro" component={Intro} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="IntroMobile" component={Intro} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={360} height={640} />
  </>
);
