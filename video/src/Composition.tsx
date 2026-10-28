import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import {
  COLORS,
  CREW,
  CUES,
  frames,
  LINEUP_CROPS,
  PORTRAIT_CUES,
  PORTRAITS,
  PROJECT,
  splitName,
} from "./config";
import "./fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };
const pos: CSSProperties = { position: "absolute" };
const heavy = '"Unbounded", sans-serif';
const titleFont = '"Titillium", sans-serif';

const useLayout = () => {
  const { width, height, fps } = useVideoConfig();
  const portrait = height > width;
  return {
    portrait,
    w: portrait ? 1080 : 1920,
    h: portrait ? 1920 : 1080,
    fps,
  };
};

function Canvas({
  children,
  background = COLORS.bg,
}: {
  children: ReactNode;
  background?: string;
}) {
  const { width } = useVideoConfig();
  const { w, h } = useLayout();
  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: "hidden" }}>
      <div
        style={{
          ...pos,
          width: w,
          height: h,
          left: 0,
          top: 0,
          scale: width / w,
          transformOrigin: "top left",
          overflow: "hidden",
          fontFamily: titleFont,
          color: COLORS.white,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
}

function Brand({
  light = false,
  label = "SPIELBERG · 2027",
}: {
  light?: boolean;
  label?: string;
}) {
  const { portrait, w } = useLayout();
  return (
    <>
      <div
        style={{
          ...pos,
          top: portrait ? 98 : 62,
          left: portrait ? 72 : 90,
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: light ? COLORS.bg : COLORS.white,
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: COLORS.red,
            padding: "4px 16px 8px",
            fontSize: portrait ? 44 : 35,
            fontWeight: 900,
            lineHeight: 1,
            transform: "skewX(-9deg)",
            color: "white",
          }}
        >
          RBR
        </div>
        <div style={{ fontSize: portrait ? 44 : 35, fontWeight: 900 }}>’27</div>
      </div>
      <div
        style={{
          ...pos,
          top: portrait ? 110 : 72,
          right: portrait ? 72 : 90,
          maxWidth: w * 0.48,
          color: light ? "#5c5c65" : COLORS.muted,
          fontSize: portrait ? 24 : 25,
          letterSpacing: 4,
          fontWeight: 700,
          zIndex: 10,
        }}
      >
        {label}
      </div>
    </>
  );
}

function RevealText({
  children,
  style,
  delay = 0,
  duration = 17,
}: {
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
}) {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        overflow: "hidden",
        paddingBottom: "0.12em",
        marginBottom: "-0.12em",
        ...style,
      }}
    >
      <div
        style={{
          translate: interpolate(
            f,
            [delay, delay + duration],
            ["0px 115%", "0px 0%"],
            ease,
          ),
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Short directional cover, never a crossfade between two faces.
function CutEdge({ color = COLORS.red }: { color?: string }) {
  const f = useCurrentFrame();
  const { w } = useLayout();
  return (
    <div
      style={{
        ...pos,
        inset: "-10% -35%",
        background: color,
        zIndex: 20,
        transform: "skewX(-16deg)",
        translate: interpolate(
          f,
          [0, 7],
          ["0px 0px", `${w * 1.8}px 0px`],
          ease,
        ),
        opacity: f < 8 ? 1 : 0,
      }}
    />
  );
}

function Opening() {
  const f = useCurrentFrame();
  const { portrait, fps } = useLayout();
  const hits = [0.56, 1.576, 2.035, 2.484, 3.686];
  return (
    <Canvas>
      <div
        style={{
          ...pos,
          inset: 0,
          background:
            "radial-gradient(ellipse at 80% 15%, #42100f 0%, transparent 58%)",
        }}
      />
      <div
        style={{
          ...pos,
          right: portrait ? -60 : 20,
          top: portrait ? 330 : 180,
          fontFamily: heavy,
          fontSize: portrait ? 510 : 650,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "2px #38303a",
          opacity: 0.55,
          translate: interpolate(f, [0, 155], ["50px 0px", "0px 0px"], clamp),
        }}
      >
        27
      </div>
      <Brand label="4 KAMERATER · 1 LØP" />
      <div
        style={{
          ...pos,
          top: portrait ? 330 : 240,
          left: portrait ? 80 : 115,
          display: "flex",
          gap: portrait ? 23 : 20,
        }}
      >
        {hits.map((hit) => (
          <div
            key={hit}
            style={{
              width: portrait ? 70 : 48,
              height: portrait ? 70 : 48,
              borderRadius: "50%",
              border: `2px solid ${f >= hit * fps ? COLORS.hot : "#412024"}`,
              background: f >= hit * fps ? COLORS.red : "#200d12",
              boxShadow:
                f >= hit * fps
                  ? "0 0 45px #e1060080, inset 0 0 14px #ffb9ad44"
                  : "none",
            }}
          />
        ))}
      </div>
      <div
        style={{
          ...pos,
          top: portrait ? 600 : 355,
          left: portrait ? 72 : 105,
          fontWeight: 900,
          fontSize: portrait ? 137 : 151,
          lineHeight: 1.01,
          letterSpacing: -3,
          transform: "skewX(-6deg)",
        }}
      >
        <RevealText delay={8}>4 KAMERATER.</RevealText>
        <RevealText delay={frames(1.576, fps)}>3 BYER.</RevealText>
        <RevealText delay={frames(2.484, fps)} style={{ color: COLORS.hot }}>
          1 LØP.
        </RevealText>
      </div>
      <div
        style={{
          ...pos,
          left: portrait ? 82 : 115,
          bottom: portrait ? 245 : 115,
          fontSize: portrait ? 34 : 29,
          letterSpacing: 5,
          color: COLORS.muted,
          fontWeight: 600,
          opacity: interpolate(f, [90, 110], [0, 1], clamp),
        }}
      >
        VÅR VEI TIL RED BULL RING
      </div>
      <div
        style={{
          ...pos,
          left: 0,
          right: 0,
          bottom: 0,
          height: portrait ? 14 : 10,
          background: COLORS.red,
          scale: `${interpolate(f, [0, 150], [0.05, 1], clamp)} 1`,
          transformOrigin: "left",
        }}
      />
    </Canvas>
  );
}

function Route() {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  return (
    <Canvas>
      <div
        style={{
          ...pos,
          inset: 0,
          background:
            "radial-gradient(ellipse at 90% 75%, #351114, transparent 65%)",
        }}
      />
      <Brand label="TRE BYER · ETT MÅL" />
      <div
        style={{
          ...pos,
          left: portrait ? 80 : 110,
          top: portrait ? 265 : 245,
          width: portrait ? 920 : 700,
        }}
      >
        <RevealText
          style={{
            fontSize: portrait ? 130 : 137,
            fontWeight: 900,
            lineHeight: 0.97,
            letterSpacing: -3,
          }}
        >
          VI MØTES
          <br />
          <span style={{ color: COLORS.hot }}>I WIEN.</span>
        </RevealText>
      </div>
      <div
        style={{
          ...pos,
          left: portrait ? 80 : 920,
          top: portrait ? 630 : 235,
          width: portrait ? 920 : 830,
          height: portrait ? 1000 : 675,
        }}
      >
        {["TRONDHEIM", "OSLO", "KRISTIANSAND"].map((city, i) => (
          <div
            key={city}
            style={{
              ...pos,
              top: i * (portrait ? 132 : 116),
              left: 0,
              fontSize: portrait ? 39 : 36,
              fontWeight: 700,
              letterSpacing: 3,
              opacity: interpolate(f, [i * 9, i * 9 + 15], [0, 1], clamp),
              translate: interpolate(
                f,
                [i * 9, i * 9 + 18],
                ["-35px 0px", "0px 0px"],
                ease,
              ),
            }}
          >
            <span style={{ color: COLORS.hot, paddingRight: 22 }}>↗</span>
            {city}
          </div>
        ))}
        <div
          style={{
            ...pos,
            left: 8,
            top: portrait ? 425 : 355,
            width: portrait ? 820 : 780,
            height: 2,
            background: "#3f3c45",
            transformOrigin: "left",
            scale: `${interpolate(f, [25, 65], [0, 1], ease)} 1`,
          }}
        />
        <div
          style={{
            ...pos,
            top: portrait ? 490 : 410,
            display: "flex",
            flexDirection: portrait ? "column" : "row",
            gap: portrait ? 32 : 24,
            fontSize: portrait ? 65 : 47,
            lineHeight: 1.3,
            fontWeight: 900,
          }}
        >
          {["WIEN", "GRAZ", "SPIELBERG"].map((city, i) => (
            <div
              key={city}
              style={{
                opacity: interpolate(
                  f,
                  [38 + i * 18, 50 + i * 18],
                  [0, 1],
                  clamp,
                ),
              }}
            >
              <span style={{ color: COLORS.red, marginRight: 14 }}>→</span>
              {city}
            </div>
          ))}
        </div>
      </div>
      <CutEdge />
    </Canvas>
  );
}

function Circuit() {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  return (
    <Canvas>
      <div
        style={{
          ...pos,
          inset: 0,
          background:
            "radial-gradient(ellipse at 38% 55%, #2b1015 0%, transparent 64%)",
        }}
      />
      <Brand label="DESTINASJON · SPIELBERG" />
      <div
        style={{
          ...pos,
          left: portrait ? 80 : 1180,
          top: portrait ? 270 : 290,
        }}
      >
        <RevealText
          style={{
            fontWeight: 900,
            fontSize: portrait ? 150 : 136,
            lineHeight: 0.98,
            letterSpacing: -3,
          }}
        >
          ETT
          <br />
          <span style={{ color: COLORS.hot }}>MÅL.</span>
        </RevealText>
        <div
          style={{
            marginTop: 30,
            fontSize: portrait ? 37 : 35,
            letterSpacing: 4,
            fontWeight: 700,
          }}
        >
          RED BULL RING
        </div>
      </div>
      <svg
        viewBox={PROJECT.circuit.viewBox}
        style={{
          ...pos,
          width: portrait ? 1080 : 1050,
          height: portrait ? 910 : 785,
          left: portrait ? -5 : 45,
          top: portrait ? 700 : 165,
          overflow: "visible",
          scale: interpolate(f, [0, 162], [0.96, 1.025], clamp),
        }}
      >
        <path
          d={PROJECT.circuit.path}
          fill="none"
          stroke="#2b2730"
          strokeWidth={13}
          strokeLinejoin="round"
        />
        <path
          d={PROJECT.circuit.path}
          fill="none"
          stroke={COLORS.red}
          strokeWidth={3}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={interpolate(f, [10, 95], [1, 0], ease)}
        />
        <path
          d={PROJECT.circuit.path}
          fill="none"
          stroke={COLORS.white}
          strokeWidth={2}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="0.08 0.92"
          strokeDashoffset={interpolate(f, [10, 151], [1, -0.15], clamp)}
        />
      </svg>
      <div
        style={{
          ...pos,
          bottom: portrait ? 160 : 110,
          left: portrait ? 80 : 105,
          fontSize: portrait ? 33 : 28,
          fontWeight: 700,
          letterSpacing: 6,
          opacity: interpolate(f, [105, 125], [0, 1], clamp),
          color: COLORS.muted,
        }}
      >
        TEAMET ER KLART.
      </div>
      <CutEdge />
    </Canvas>
  );
}

function DriverClose({ index }: { index: number }) {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const driver = CREW[index];
  const crop = PORTRAITS[index].close;
  return (
    <Canvas>
      <div
        style={{
          ...pos,
          inset: 0,
          background: `radial-gradient(ellipse at 65% 45%, ${driver.team}3d, transparent 66%)`,
        }}
      />
      <div
        style={{
          ...pos,
          top: portrait ? 425 : 200,
          left: portrait ? 20 : 65,
          fontFamily: heavy,
          fontSize: portrait ? 620 : 700,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `2px ${driver.team}`,
          opacity: 0.7,
          translate: interpolate(f, [0, 36], ["-80px 0px", "0px 0px"], ease),
        }}
      >
        {driver.number.toString().padStart(2, "0")}
      </div>
      <CanvasImage
        src={staticFile(driver.photos.close)}
        style={{
          ...pos,
          left: portrait ? crop.mobileX : crop.desktopX,
          top: portrait ? crop.mobileY : crop.desktopY,
          height: portrait ? crop.mobileHeight : crop.desktopHeight,
          width: "auto",
          scale: interpolate(f, [0, 36], [1.07, 1], ease),
          transformOrigin: "50% 25%",
        }}
      />
      <div
        style={{
          ...pos,
          inset: 0,
          background: "linear-gradient(0deg, #0b0b10 3%, transparent 45%)",
        }}
      />
      <Brand label={`TEAM RBR · ${driver.code}`} />
      <div
        style={{
          ...pos,
          left: portrait ? 80 : 110,
          bottom: portrait ? 235 : 140,
          fontSize: portrait ? 53 : 51,
          fontWeight: 700,
          letterSpacing: 8,
          color: driver.team,
        }}
      >
        {driver.code} / {driver.number.toString().padStart(2, "0")}
      </div>
      <CutEdge color={index === 0 ? COLORS.red : driver.team} />
    </Canvas>
  );
}

function DriverPortrait({ index }: { index: number }) {
  const f = useCurrentFrame();
  const { portrait, w, h } = useLayout();
  const d = CREW[index];
  const settings = PORTRAITS[index];
  const name = splitName(d);
  const light = settings.look === "light";
  const bg = light ? "#d9d9dc" : COLORS.bg;
  const ink = light ? COLORS.bg : COLORS.white;
  const crop = portrait ? settings.mobile : settings.desktop;
  return (
    <Canvas background={bg}>
      <div
        style={{
          ...pos,
          inset: 0,
          background: light
            ? "radial-gradient(ellipse at 60% 40%, #ffffff, #c1c2c8)"
            : `radial-gradient(ellipse at 64% 52%, ${d.team}32, transparent 66%)`,
        }}
      />
      {settings.look === "diagonal" && (
        <div
          style={{
            ...pos,
            left: -w * 0.2,
            top: h * 0.57,
            width: w * 1.6,
            height: h * 0.65,
            background: `linear-gradient(145deg, ${d.team}, #7c2003 80%)`,
            transform: "rotate(-13deg)",
            borderTop: `3px solid ${COLORS.white}`,
            translate: interpolate(f, [0, 23], ["0px 80px", "0px 0px"], ease),
          }}
        />
      )}
      {settings.look === "precision" && (
        <>
          <div
            style={{
              ...pos,
              left: portrait ? 120 : 1020,
              top: portrait ? 400 : 195,
              width: portrait ? 840 : 700,
              height: portrait ? 1150 : 800,
              border: `2px solid ${d.team}70`,
              transform: "skewY(-4deg)",
            }}
          />
          <div
            style={{
              ...pos,
              left: 0,
              top: h * 0.38,
              width: w,
              height: 2,
              background: `${d.team}50`,
            }}
          />
        </>
      )}
      {settings.look === "spotlight" && (
        <div
          style={{
            ...pos,
            left: w * 0.25,
            top: -h * 0.25,
            width: w * 0.7,
            height: h * 1.4,
            background: `linear-gradient(90deg, transparent, ${d.team}22, transparent)`,
            transform: "rotate(21deg)",
          }}
        />
      )}
      <div
        style={{
          ...pos,
          left: portrait ? -30 : 25,
          top: portrait ? 425 : 200,
          fontFamily: heavy,
          fontSize: portrait ? 295 : 340,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: light ? "#a9a9b0" : `${d.team}25`,
          opacity: light ? 0.65 : 1,
          translate: interpolate(f, [0, 160], ["25px 0px", "-65px 0px"], clamp),
        }}
      >
        {name.last}
      </div>
      <CanvasImage
        src={staticFile(settings.main)}
        style={{
          ...pos,
          left: crop.left,
          top: crop.top,
          height: crop.height,
          width: "auto",
          scale: interpolate(f, [0, 160], [1.035, 1], clamp),
          translate: interpolate(f, [0, 18], ["35px 0px", "0px 0px"], ease),
          transformOrigin: "50% 25%",
        }}
      />
      <div
        style={{
          ...pos,
          inset: 0,
          background: `linear-gradient(0deg, ${bg} 0%, ${bg}f0 ${portrait ? "19%" : "10%"}, ${bg}00 ${portrait ? "51%" : "49%"})`,
        }}
      />
      <Brand
        light={light}
        label={`${d.code} · ${d.number.toString().padStart(2, "0")}`}
      />
      <div
        style={{
          ...pos,
          left: portrait ? 80 : 110,
          top: portrait ? 280 : 200,
          color: light ? "#5a5b66" : COLORS.muted,
          fontWeight: 700,
          fontSize: portrait ? 29 : 25,
          letterSpacing: 5,
        }}
      >
        {d.role.toUpperCase()} / {d.home.toUpperCase()}
      </div>
      <div
        style={{
          ...pos,
          left: portrait ? 72 : 105,
          right: portrait ? 65 : 80,
          bottom: portrait ? 260 : 155,
          color: ink,
        }}
      >
        <RevealText
          delay={1}
          style={{
            fontFamily: '"Mr Dafoe", cursive',
            fontWeight: 400,
            fontSize: portrait ? (index === 2 ? 83 : 100) : 93,
            color: light ? COLORS.red : index === 1 ? COLORS.white : d.team,
            lineHeight: 1.1,
            paddingLeft: 5,
          }}
        >
          {name.first}
        </RevealText>
        <RevealText
          delay={6}
          style={{
            fontFamily: heavy,
            fontWeight: 800,
            fontSize: portrait ? settings.mobileNameSize : settings.nameSize,
            lineHeight: 1.13,
            letterSpacing: portrait ? -1.5 : -3,
            marginTop: 10,
          }}
        >
          {name.last}
        </RevealText>
        <div
          style={{
            marginTop: portrait ? 34 : 26,
            height: 5,
            width: portrait ? 170 : 130,
            background: d.team,
            transformOrigin: "left",
            scale: `${interpolate(f, [10, 28], [0, 1], ease)} 1`,
          }}
        />
      </div>
    </Canvas>
  );
}

function DriverScene({ index, duration }: { index: number; duration: number }) {
  const { fps } = useVideoConfig();
  const starts = [CUES.filip, CUES.pal, CUES.hans, CUES.havard];
  const cut = frames(PORTRAIT_CUES[index], fps) - frames(starts[index], fps);
  return (
    <>
      <Sequence name="Nærbilde" durationInFrames={cut}>
        <DriverClose index={index} />
      </Sequence>
      <Sequence
        name="Navn og portrett"
        from={cut}
        durationInFrames={duration - cut}
      >
        <DriverPortrait index={index} />
      </Sequence>
    </>
  );
}

function Lineup() {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  return (
    <Canvas>
      <Brand label="HELE TEAMET" />
      <div
        style={{
          ...pos,
          left: portrait ? 80 : 105,
          top: portrait ? 250 : 185,
          fontWeight: 900,
          fontSize: portrait ? 118 : 112,
          lineHeight: 1,
        }}
      >
        <RevealText>
          SAMME TEAM.
          <br />
          <span style={{ color: COLORS.hot }}>SAMME MÅL.</span>
        </RevealText>
      </div>
      <div
        style={{
          ...pos,
          left: portrait ? 65 : 80,
          right: portrait ? 65 : 80,
          top: portrait ? 610 : 465,
          bottom: portrait ? 170 : 85,
          display: "grid",
          gridTemplateColumns: portrait ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: portrait ? 22 : 24,
        }}
      >
        {CREW.map((d, i) => (
          <div
            key={d.id}
            style={{
              position: "relative",
              overflow: "hidden",
              background: `linear-gradient(160deg, ${d.team}33, #121218 65%)`,
              borderTop: `3px solid ${d.team}`,
              opacity: interpolate(f, [i * 3, i * 3 + 10], [0, 1], clamp),
            }}
          >
            <div
              style={{
                ...pos,
                top: 26,
                right: 25,
                fontFamily: heavy,
                fontSize: portrait ? 100 : 120,
                color: `${d.team}66`,
              }}
            >
              {d.number.toString().padStart(2, "0")}
            </div>
            <CanvasImage
              src={staticFile(d.photos.close)}
              style={{
                ...pos,
                ...(portrait
                  ? LINEUP_CROPS[i].mobile
                  : LINEUP_CROPS[i].desktop),
                width: "auto",
                scale: interpolate(f, [0, 145], [1.03, 1], clamp),
                transformOrigin: "50% 25%",
              }}
            />
            <div
              style={{
                ...pos,
                inset: 0,
                background:
                  "linear-gradient(0deg, #0b0b10 0%, transparent 66%)",
              }}
            />
            <div
              style={{
                ...pos,
                bottom: portrait ? 36 : 30,
                left: portrait ? 26 : 25,
                fontWeight: 900,
                fontSize: portrait ? (i === 2 ? 32 : 40) : i === 2 ? 35 : 44,
                lineHeight: 1.1,
              }}
            >
              {d.name}
              <div
                style={{
                  marginTop: 12,
                  fontSize: portrait ? 24 : 23,
                  fontWeight: 700,
                  color: d.team,
                  letterSpacing: 3,
                }}
              >
                {d.code} / {d.role.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
      <CutEdge />
    </Canvas>
  );
}

function Destination() {
  const f = useCurrentFrame();
  const { portrait, w } = useLayout();
  return (
    <Canvas>
      <div
        style={{
          ...pos,
          inset: 0,
          background:
            "radial-gradient(ellipse at 45% 80%, #4b0d12, transparent 70%)",
        }}
      />
      <Brand label="NESTE STOPP" />
      <div
        style={{
          ...pos,
          left: portrait ? 80 : 110,
          top: portrait ? 520 : 255,
          fontSize: portrait ? 125 : 200,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: -4,
        }}
      >
        <RevealText
          style={{
            fontSize: portrait ? 55 : 53,
            lineHeight: 1.2,
            letterSpacing: 5,
            color: COLORS.muted,
          }}
        >
          NESTE STOPP:
        </RevealText>
        <RevealText delay={5} style={{ marginTop: 25 }}>
          SPIELBERG.
        </RevealText>
      </div>
      <div
        style={{
          ...pos,
          top: portrait ? 1190 : 750,
          left: -200,
          width: w + 400,
          height: 7,
          background: COLORS.red,
          transform: "rotate(-5deg)",
        }}
      />
      <CanvasImage
        src={staticFile("car.webp")}
        style={{
          ...pos,
          width: portrait ? 1540 : 1820,
          height: "auto",
          top: portrait ? 950 : 570,
          left: 0,
          translate: interpolate(
            f,
            [7, 39, 70],
            [`${-w * 1.45}px 0px`, `${w * 0.02}px 0px`, `${w * 1.3}px 0px`],
            { ...clamp, easing: Easing.bezier(0.4, 0, 0.65, 1) },
          ),
        }}
      />
      <CutEdge />
    </Canvas>
  );
}

function EndTitle() {
  const f = useCurrentFrame();
  const { portrait, fps } = useLayout();
  const exit = frames(CUES.handoff, fps) - frames(CUES.title, fps);
  return (
    <Canvas>
      <div
        style={{
          ...pos,
          inset: 0,
          opacity: interpolate(f, [exit, 147], [1, 0], clamp),
        }}
      >
        <div
          style={{
            ...pos,
            inset: 0,
            background:
              "radial-gradient(ellipse at 80% 65%, #380d15, transparent 70%)",
          }}
        />
        <Brand label="4 KAMERATER · 3 BYER · 1 LØP" />
        <div
          style={{
            ...pos,
            left: portrait ? 75 : 110,
            top: portrait ? 500 : 285,
            fontWeight: 900,
            fontSize: portrait ? 181 : 221,
            lineHeight: 0.93,
            letterSpacing: -5,
            transform: "skewX(-5deg)",
          }}
        >
          <RevealText delay={1} duration={12}>
            RED BULL
          </RevealText>
          <RevealText delay={4} duration={12}>
            RING<span style={{ color: COLORS.red }}>.</span>
          </RevealText>
        </div>
        <div
          style={{
            ...pos,
            left: portrait ? 75 : 1200,
            top: portrait ? 950 : 290,
            fontFamily: heavy,
            fontWeight: 800,
            fontSize: portrait ? 246 : 255,
            lineHeight: 1.02,
            letterSpacing: -14,
            color: COLORS.hot,
          }}
        >
          <RevealText delay={7} duration={13}>
            {portrait ? (
              "2027"
            ) : (
              <>
                20
                <br />
                27
              </>
            )}
          </RevealText>
        </div>
        <div
          style={{
            ...pos,
            left: portrait ? 80 : 115,
            bottom: portrait ? 320 : 145,
            fontSize: portrait ? 39 : 36,
            letterSpacing: portrait ? 2 : 5,
            fontWeight: 700,
            opacity: interpolate(f, [14, 27], [0, 1], clamp),
          }}
        >
          WIEN <span style={{ color: COLORS.red }}>→</span> GRAZ{" "}
          <span style={{ color: COLORS.red }}>→</span> SPIELBERG
        </div>
        <div
          style={{
            ...pos,
            left: portrait ? 80 : 115,
            bottom: portrait ? 220 : 80,
            fontSize: portrait ? 28 : 25,
            letterSpacing: 5,
            color: COLORS.muted,
            fontWeight: 600,
          }}
        >
          NESTE: TURPLANLEGGINGEN
        </div>
      </div>
      <CutEdge />
    </Canvas>
  );
}

function Soundtrack() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Audio
      name="F1 theme · normalisert start"
      src={staticFile("audio/f1theme.wav")}
      volume={interpolate(
        f,
        [0, 3, frames(CUES.handoff, fps), frames(CUES.audioEnd, fps)],
        [0, 0.70795, 0.70795, 0],
        clamp,
      )}
    />
  );
}

export function RedBullRingIntro() {
  const { fps } = useVideoConfig();
  const at = (t: number) => frames(t, fps);
  const between = (a: number, b: number) => at(b) - at(a);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Track name="Filmsekvens">
        <Sequence name="01 · Startlys" durationInFrames={at(CUES.route)}>
          <Opening />
        </Sequence>
        <Sequence
          name="02 · Tre byer"
          from={at(CUES.route)}
          durationInFrames={between(CUES.route, CUES.circuit)}
        >
          <Route />
        </Sequence>
        <Sequence
          name="03 · Ett mål"
          from={at(CUES.circuit)}
          durationInFrames={between(CUES.circuit, CUES.filip)}
        >
          <Circuit />
        </Sequence>
        <Sequence
          name="04 · Filip"
          from={at(CUES.filip)}
          durationInFrames={between(CUES.filip, CUES.pal)}
        >
          <DriverScene index={0} duration={between(CUES.filip, CUES.pal)} />
        </Sequence>
        <Sequence
          name="05 · Pål André"
          from={at(CUES.pal)}
          durationInFrames={between(CUES.pal, CUES.hans)}
        >
          <DriverScene index={1} duration={between(CUES.pal, CUES.hans)} />
        </Sequence>
        <Sequence
          name="06 · Hans-Kristian"
          from={at(CUES.hans)}
          durationInFrames={between(CUES.hans, CUES.havard)}
        >
          <DriverScene index={2} duration={between(CUES.hans, CUES.havard)} />
        </Sequence>
        <Sequence
          name="07 · Håvard"
          from={at(CUES.havard)}
          durationInFrames={between(CUES.havard, CUES.lineup)}
        >
          <DriverScene index={3} duration={between(CUES.havard, CUES.lineup)} />
        </Sequence>
        <Sequence
          name="08 · Hele teamet"
          from={at(CUES.lineup)}
          durationInFrames={between(CUES.lineup, CUES.destination)}
        >
          <Lineup />
        </Sequence>
        <Sequence
          name="09 · Spielberg"
          from={at(CUES.destination)}
          durationInFrames={between(CUES.destination, CUES.title)}
        >
          <Destination />
        </Sequence>
        <Sequence
          name="10 · Red Bull Ring 2027"
          from={at(CUES.title)}
          durationInFrames={between(CUES.title, CUES.end)}
        >
          <EndTitle />
        </Sequence>
      </Track>
      <Track name="Musikk">
        <Soundtrack />
      </Track>
    </AbsoluteFill>
  );
}
