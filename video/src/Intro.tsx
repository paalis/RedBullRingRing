import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CarPass } from "./CarPass";
import { Opening } from "./Opening";
import { TeamIntro } from "./TeamIntro";
import { CAR, DURATION, FADE_OUT, TEAM_AT } from "./timeline";
import "./fonts";

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <AbsoluteFill style={{ zIndex: 20, background: "#0b0b10", opacity: interpolate(frame / fps, [DURATION - FADE_OUT, DURATION], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />;
};

// Introfilmen til nettsiden, synket til F1-temaet: åpningen (startlys, rute, bane, punchline),
// bilen som overgang, og teamintroen med alle fire førerne og line-upen.
export const Intro: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#0b0b10" }}>
      <Audio
        src={staticFile("f1-theme.m4a")}
        volume={(f) => interpolate(f / fps, [DURATION - FADE_OUT, DURATION], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      <Sequence name="Åpning" durationInFrames={Math.round(TEAM_AT * fps)}>
        <Opening />
      </Sequence>
      <Sequence name="Teamintro" from={Math.round(TEAM_AT * fps)}>
        <TeamIntro />
      </Sequence>
      <Sequence name="Bilen" from={Math.round(CAR.from * fps)} durationInFrames={Math.round((TEAM_AT + 0.6 - CAR.from) * fps)}>
        <CarPass />
      </Sequence>
      <FadeOut />
    </AbsoluteFill>
  );
};
