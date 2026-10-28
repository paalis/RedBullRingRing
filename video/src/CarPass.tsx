import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CAR, TEAM_AT } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Overgangen inn i teamintroen: Red Bull-bilen suser over skjermen med fartsstriper og risting,
// og et hvitt blink tar oss inn i «Line-up» på slaget ved 15,36 s.
export const CarPass: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = CAR.from + frame / fps;
  const portrait = height > width;
  const carW = portrait ? width * 1.3 : Math.min(width * 0.8, 1100);
  const end = TEAM_AT + 0.25;
  const x = interpolate(t, [CAR.from, end], [-carW * 1.05, width + carW * 0.05], { ...clamp, easing: Easing.bezier(0.5, 0.1, 0.5, 0.9) });
  const blur = interpolate(t, [CAR.from, CAR.peak, end], [2, 7, 3], clamp);
  const shake = t > CAR.peak - 0.45 && t < TEAM_AT ? Math.sin(t * 90) * 6 : 0;
  const flash = interpolate(t, [TEAM_AT - 0.1, TEAM_AT, TEAM_AT + 0.22], [0, 0.8, 0], clamp);
  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: "none", translate: `${shake}px ${shake * 0.5}px` }}>
      <div style={{ position: "absolute", left: x, top: portrait ? height * 0.52 : height * 0.48, width: carW, translate: "0 -50%" }}>
        <div
          style={{
            position: "absolute", right: "86%", top: "34%", width: width * 0.95, height: "36%", borderRadius: "50%", filter: "blur(12px)",
            background: "linear-gradient(90deg, transparent, rgba(255, 42, 31, .3) 55%, rgba(255, 210, 0, .6))",
          }}
        />
        <Img src={staticFile("car.webp")} style={{ width: "100%", filter: `blur(${blur * 0.15}px) drop-shadow(0 18px 18px rgba(0, 0, 0, .6))` }} />
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
