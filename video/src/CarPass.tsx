import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CAR, TEAM_AT } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (t: number, a: [number, number], b: [number, number], ease?: (x: number) => number) =>
  interpolate(t, a, b, { ...clamp, easing: ease });

// Mål i car.webp (1456 × 307): bilen peker mot høyre.
const IMG = { w: 1456, h: 307, rear: { x: 170, y: 213, r: 98 }, front: { x: 1095, y: 207, r: 92 }, cockpit: { x: 700, y: 110 }, rainLight: { x: 24, y: 172 } };
const SRC = staticFile("car.webp");

// Bildet av bilen plassert slik at bildepunktet (px, py) havner på (x, y) på skjermen, med bredde w.
const Car: React.FC<{ x: number; y: number; w: number; px?: number; py?: number; style?: React.CSSProperties }> = ({ x, y, w, px = IMG.w / 2, py = IMG.h / 2, style }) => {
  const k = w / IMG.w;
  return <Img src={SRC} style={{ position: "absolute", left: x - px * k, top: y - py * k, width: w, maxWidth: "none", ...style }} />;
};

// Ett hjul klippet ut av bildet og rotert om navet (gir spinnende hjul med uskarphet).
const Wheel: React.FC<{ x: number; y: number; w: number; wheel: { x: number; y: number; r: number }; angle: number; blur: number }> = ({ x, y, w, wheel, angle, blur }) => {
  const k = w / IMG.w;
  const r = wheel.r * k;
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", overflow: "hidden", rotate: `${angle}deg`, filter: `blur(${blur}px)` }}>
      <Img src={SRC} style={{ position: "absolute", left: r - wheel.x * k, top: r - wheel.y * k, width: w, maxWidth: "none" }} />
    </div>
  );
};

// Fartsstriper over hele bildet; `speed` 0–1 styrer lengde og styrke.
const SpeedLines: React.FC<{ t: number; W: number; H: number; speed: number; color?: string; count?: number }> = ({ t, W, H, speed, color = "255,255,255", count = 28 }) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const y = random(`sl-y-${i}`) * H;
      const len = (0.15 + random(`sl-l-${i}`) * 0.5) * W * (0.3 + speed);
      const x = ((random(`sl-x-${i}`) * 2 - t * (2.5 + random(`sl-v-${i}`) * 3) * (0.4 + speed)) % 2 + 2) % 2 * W * 1.4 - W * 0.4;
      const th = 1 + random(`sl-t-${i}`) * 3 * (H / 1080);
      return (
        <div key={i} style={{ position: "absolute", left: W - x, top: y, width: len, height: th, opacity: speed * (0.35 + random(`sl-o-${i}`) * 0.6),
          background: `linear-gradient(90deg, rgba(${color},0), rgba(${color},1))` }} />
      );
    })}
  </>
);

// Gnister som spruter bak bilen fra vroom-tidspunktet og dør ut i stillheten etterpå.
const Sparks: React.FC<{ t: number; W: number; H: number; floorY: number }> = ({ t, W, H, floorY }) => (
  <>
    {Array.from({ length: 70 }, (_, i) => {
      const born = CAR.vroom + 0.02 + random(`sp-b-${i}`) * 0.22;
      const age = t - born;
      if (age < 0 || age > 0.75) return null;
      const startX = lerp(born, [CAR.vroom, CAR.peak + 0.11], [-0.1 * W, 1.05 * W]) - random(`sp-o-${i}`) * 0.2 * W;
      const vx = -(0.4 + random(`sp-vx-${i}`) * 1.2) * W;
      const vy = -(0.15 + random(`sp-vy-${i}`) * 0.45) * H;
      const x = startX + vx * age;
      const y = floorY + vy * age + 1.6 * H * age * age;
      const s = (2 + random(`sp-s-${i}`) * 4) * (H / 1080) * 1.6;
      const fade = 1 - age / 0.75;
      return (
        <div key={i} style={{ position: "absolute", left: x, top: y, width: s * 7, height: s, borderRadius: s, opacity: fade, rotate: `${Math.atan2(vy + 3.2 * H * age, vx) * 57.3}deg`,
          background: "linear-gradient(90deg, rgba(255,210,0,0), #ffd200 60%, #fff)", boxShadow: `0 0 ${s * 3}px #ff8a00` }} />
      );
    })}
  </>
);

// Asfalt med fartslinjer i perspektiv (gulvet bilen står og kjører på).
const Tarmac: React.FC<{ t: number; W: number; H: number; horizon: number; speed: number }> = ({ t, W, H, horizon, speed }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="cp-floor" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#1a0306" />
        <stop offset="1" stopColor="#050506" />
      </linearGradient>
    </defs>
    <rect x={0} y={horizon} width={W} height={H - horizon} fill="url(#cp-floor)" />
    {Array.from({ length: 14 }, (_, i) => {
      const u = (((i / 14 + t * (0.15 + speed * 2.5)) % 1) + 1) % 1;
      const y = horizon + (H - horizon) * u * u;
      return <line key={i} x1={0} x2={W} y1={y} y2={y} stroke="rgba(255,255,255,.12)" strokeWidth={1 + u * 3} />;
    })}
    <line x1={0} x2={W} y1={horizon} y2={horizon} stroke="rgba(255,60,40,.6)" strokeWidth={2} />
  </svg>
);

// Bilsekvensen (13,6–15,36 s): bilen på startgrid, raske nærbilder i den rolige oppbyggingen, så suser den over
// skjermen på vroom-lyden i musikken (topp ved 14,88 s). Lysstriper og gnister dør ut i stillheten etterpå,
// og et hvitt blink tar oss inn i teamintroen på trommeslaget ved 15,36 s.
export const CarPass: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = CAR.from + frame / fps;
  const portrait = H > W;
  const u = H / 1080; // skala for detaljer

  // Kamerarist: litt tomgang på grid, kraftig på vroom-toppen.
  const idle = t < CAR.wheel ? Math.sin(t * 140) * 1.2 * u : 0;
  const hit = interpolate(t, [CAR.vroom, CAR.peak, CAR.after + 0.1], [0, 1, 0], clamp);
  const shakeX = idle + Math.sin(t * 97) * 26 * u * hit + (random(`shx-${frame}`) - 0.5) * 18 * u * hit;
  const shakeY = Math.cos(t * 83) * 14 * u * hit + (random(`shy-${frame}`) - 0.5) * 10 * u * hit;
  const flash = lerp(t, [TEAM_AT - 0.06, TEAM_AT], [0, 0.9]) * lerp(t, [TEAM_AT, TEAM_AT + 0.25], [1, 0]);

  let shot: React.ReactNode = null;
  if (t < CAR.wheel) {
    // A · Startgrid: bilen står lavt i rødt motlys og dirrer, regnlyset blinker, kameraet kryper inn.
    const p = lerp(t, [CAR.from, CAR.wheel], [0, 1]);
    const carW = (portrait ? 2.1 : 1.08) * W * (1 + 0.06 * p);
    const cx = portrait ? W * 0.62 : W * 0.5;
    const cy = H * (portrait ? 0.56 : 0.6);
    const k = carW / IMG.w;
    const blink = Math.floor(t * 8) % 2 === 0;
    shot = (
      <AbsoluteFill style={{ background: "#050506" }}>
        <Tarmac t={t} W={W} H={H} horizon={cy + 0.18 * carW * (IMG.h / IMG.w)} speed={0} />
        <div style={{ position: "absolute", left: cx - carW * 0.6, top: cy - carW * 0.25, width: carW * 1.2, height: carW * 0.5, borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(225,6,0,.55), rgba(225,6,0,0))", filter: `blur(${30 * u}px)`, opacity: lerp(t, [CAR.from, CAR.from + 0.3], [0, 1]) }} />
        <Car x={cx} y={cy} w={carW} style={{ filter: `brightness(${0.35 + 0.15 * p}) contrast(1.3) drop-shadow(0 ${-3 * u}px ${2 * u}px rgba(255,40,30,.9)) drop-shadow(0 0 ${30 * u}px rgba(255,30,20,.35))`, opacity: lerp(t, [CAR.from, CAR.from + 0.18], [0, 1]) }} />
        <div style={{ position: "absolute", left: cx - (IMG.w / 2 - IMG.rainLight.x) * k - 12 * u, top: cy - (IMG.h / 2 - IMG.rainLight.y) * k - 12 * u, width: 24 * u, height: 24 * u, borderRadius: "50%",
          background: blink ? "#ff2a1a" : "#3a0503", boxShadow: blink ? `0 0 ${30 * u}px ${10 * u}px rgba(255,40,20,.8)` : "none" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: H * 0.16, background: "#000" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * 0.16, background: "#000" }} />
      </AbsoluteFill>
    );
  } else if (t < CAR.vroom) {
    // B–D · Tre raske nærbilder: bakhjulet som spinner, nesen som glir forbi, cockpiten som skyves inn.
    const cut = t < CAR.nose ? "wheel" : t < CAR.cockpit ? "nose" : "cockpit";
    const tint = "brightness(.5) contrast(1.35) saturate(1.1) drop-shadow(0 -3px 2px rgba(255,40,30,.95))";
    let body: React.ReactNode;
    if (cut === "wheel") {
      const p = lerp(t, [CAR.wheel, CAR.nose], [0, 1]);
      const carW = (portrait ? 7.5 : 5.2) * W;
      const wx = W * 0.5 + (1 - p) * 30 * u;
      const wy = H * 0.5;
      const k = carW / IMG.w;
      body = (
        <>
          <Car x={wx} y={wy} w={carW} px={IMG.rear.x} py={IMG.rear.y} style={{ filter: tint }} />
          <Wheel x={wx} y={wy} w={carW} wheel={IMG.rear} angle={-t * 2400} blur={6 * u} />
          <div style={{ position: "absolute", left: wx - IMG.rear.r * k * 1.05, top: wy - IMG.rear.r * k * 1.05, width: IMG.rear.r * k * 2.1, height: IMG.rear.r * k * 2.1, borderRadius: "50%",
            border: `${10 * u}px solid rgba(255,40,30,.75)`, filter: `blur(${12 * u}px)` }} />
        </>
      );
    } else if (cut === "nose") {
      const p = lerp(t, [CAR.nose, CAR.cockpit], [0, 1]);
      const carW = (portrait ? 5 : 3.4) * W;
      body = (
        <>
          <Car x={W * (0.75 - 0.5 * p)} y={H * 0.52} w={carW} px={1330} py={210} style={{ filter: tint }} />
          <SpeedLines t={t} W={W} H={H} speed={0.6} color="255,60,40" />
        </>
      );
    } else {
      const p = lerp(t, [CAR.cockpit, CAR.vroom], [0, 1], Easing.in(Easing.cubic));
      const carW = (portrait ? 4.6 : 3) * W * (1 + 0.5 * p);
      body = (
        <>
          <Car x={W * 0.5} y={H * 0.55} w={carW} px={IMG.cockpit.x} py={IMG.cockpit.y} style={{ filter: `${tint} blur(${p * 6 * u}px)` }} />
          <AbsoluteFill style={{ background: "#000", opacity: lerp(t, [CAR.vroom - 0.06, CAR.vroom], [0, 1]) }} />
        </>
      );
    }
    shot = <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #2a0508, #050506 70%)", overflow: "hidden" }}>{body}</AbsoluteFill>;
  } else if (t < TEAM_AT) {
    // E–F · VROOM: lavt kamera, bilen suser over (raskest på toppen i lyden), så stillheten med lysstriper og gnister.
    const carW = (portrait ? 1.9 : 1.15) * W;
    const k = carW / IMG.w;
    const floorY = H * (portrait ? 0.62 : 0.7);
    const cy = floorY - IMG.h * k * 0.48;
    // Bilen er midt i bildet nøyaktig på toppen i lyden, og ute av bildet 0,1 s senere.
    const x = interpolate(t, [CAR.vroom, CAR.peak, CAR.peak + 0.11], [-carW * 0.55, W * 0.5, W + carW * 0.6], clamp);
    const vel = interpolate(t, [CAR.vroom, CAR.peak, CAR.after], [0.5, 1, 0.5], clamp) * (t < CAR.after ? 1 : 0);
    const speedAfter = lerp(t, [CAR.after, TEAM_AT], [0.5, 0]);
    const speed = t < CAR.after ? vel : speedAfter;
    const fov = 1 + 0.09 * hit;
    const trail = lerp(t, [CAR.vroom, CAR.after], [0, 1]) * lerp(t, [CAR.after, TEAM_AT - 0.05], [1, 0], Easing.out(Easing.quad));
    const trailEnd = Math.min(x, W * 1.1);
    const darken = lerp(t, [CAR.after, TEAM_AT - 0.05], [0, 0.85]);
    shot = (
      <AbsoluteFill style={{ background: "#050506", overflow: "hidden", scale: String(fov) }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 50% at 50% ${(floorY / H) * 100}%, rgba(225,6,0,${0.25 + 0.45 * hit}), transparent 70%)` }} />
        <Tarmac t={t} W={W} H={H} horizon={floorY - 4 * u} speed={speed} />
        {/* Lysstriper langs sporet bilen etterlater seg */}
        <div style={{ position: "absolute", left: -W * 0.1, width: trailEnd + W * 0.1, top: cy - carW * 0.02, height: carW * 0.045, opacity: trail, filter: `blur(${8 * u}px)`,
          background: "linear-gradient(90deg, rgba(255,42,31,0), rgba(255,42,31,.85) 70%, #ffd200)" }} />
        <div style={{ position: "absolute", left: -W * 0.1, width: trailEnd + W * 0.1, top: cy + carW * 0.05, height: carW * 0.012, opacity: trail, filter: `blur(${2 * u}px)`,
          background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.95))" }} />
        {/* Bevegelsesuskarphet: spøkelseskopier bak bilen */}
        {t < CAR.after + 0.05 &&
          Array.from({ length: 9 }, (_, i) => (
            <Car key={i} x={x - (i + 1) * 0.045 * carW * vel} y={cy} w={carW} style={{ opacity: 0.32 * (1 - i / 9) * vel, filter: `blur(${(2 + i) * u}px) brightness(.9)` }} />
          ))}
        {t < CAR.after + 0.05 && (
          <>
            <Car x={x} y={cy} w={carW} style={{ filter: `blur(${1.5 * vel * u}px) drop-shadow(0 ${18 * u}px ${18 * u}px rgba(0,0,0,.6))` }} />
            <Wheel x={x + (IMG.rear.x - IMG.w / 2) * k} y={cy + (IMG.rear.y - IMG.h / 2) * k} w={carW} wheel={IMG.rear} angle={t * 5000} blur={5 * u} />
            <Wheel x={x + (IMG.front.x - IMG.w / 2) * k} y={cy + (IMG.front.y - IMG.h / 2) * k} w={carW} wheel={IMG.front} angle={t * 5000} blur={5 * u} />
          </>
        )}
        <Sparks t={t} W={W} H={H} floorY={floorY} />
        <SpeedLines t={t} W={W} H={H} speed={speed} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(225,6,0,.55))", opacity: interpolate(t, [CAR.vroom, CAR.peak, CAR.peak + 0.12], [0, 1, 0], clamp) }} />
        <AbsoluteFill style={{ background: "#000", opacity: darken }} />
        {/* Rett før trommene: en hvit linje samler seg på midten og blinker over i «Line-up» */}
        <div style={{ position: "absolute", top: H / 2 - 2 * u, height: 4 * u, left: W / 2, width: lerp(t, [TEAM_AT - 0.16, TEAM_AT], [0, W]), translate: "-50% 0",
          background: "#fff", boxShadow: `0 0 ${30 * u}px ${8 * u}px rgba(255,255,255,.8)`, opacity: lerp(t, [TEAM_AT - 0.16, TEAM_AT - 0.12], [0, 1]) }} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ zIndex: 10, pointerEvents: "none", translate: `${shakeX}px ${shakeY}px` }}>
      {shot}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
