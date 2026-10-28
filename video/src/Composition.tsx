import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Frame-driven animation keeps preview and export identical.
const IntroTitle = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="Intro title"
      style={{
        opacity: interpolate(frame, [0, 0.7 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 0.7 * fps], ["0px 32px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 104,
          lineHeight: 1.05,
          letterSpacing: -5,
          fontWeight: 900,
        }}
      >
        4 kamerater.
        <br />
        3 byer.
        <br />
        <span style={{ color: "#e10600" }}>1 løp.</span>
      </h1>
    </Interactive.Div>
  );
};

export const RedBullRingIntro = () => (
  <AbsoluteFill
    style={{
      backgroundColor: "#0b0b10",
      color: "#ffffff",
      fontFamily: "Arial, sans-serif",
      padding: "64px 80px",
      justifyContent: "space-between",
      borderLeft: "12px solid #e10600",
    }}
  >
    <div
      style={{
        color: "#b6b6c4",
        fontSize: 24,
        letterSpacing: 5,
        fontWeight: 700,
      }}
    >
      RBR ’27 · ØSTERRIKES GRAND PRIX
    </div>
    <IntroTitle />
    <div style={{ fontSize: 28, lineHeight: 1.5 }}>
      <div>Wien → Graz → Spielberg</div>
      <div style={{ color: "#b6b6c4" }}>8.–12. juli 2027</div>
    </div>
  </AbsoluteFill>
);
