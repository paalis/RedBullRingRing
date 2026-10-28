import project from "../public/project.json";

export const PROJECT = project;
export const CREW = project.crew;
export type Driver = (typeof CREW)[number];
export const COLORS = {
  bg: "#0b0b10",
  panel: "#15151e",
  white: "#f4f4f6",
  muted: "#a4a4b4",
  red: "#e10600",
  hot: "#ff2a1f",
};

// Seconds from first DECODED SAMPLE of the normalized WAV, no extra trim.
// Round boundaries, then subtract to get durations; never round each length.
export const CUES = {
  route: 5.178,
  circuit: 9.977,
  filip: 15.375057,
  pal: 21.381406,
  hans: 27.377778,
  havard: 33.384127,
  lineup: 39.979138,
  destination: 44.788209,
  title: 47.182766,
  handoff: 50.82449,
  audioEnd: 52.088163,
  end: 52.1,
};

// Absolute measured onsets for each close-up → named portrait cut.
export const PORTRAIT_CUES = [16.582313, 22.578685, 28.585034, 34.581406];

// Different source aspect ratios need different line-up framing.
export const LINEUP_CROPS = [
  {
    desktop: { left: -30, top: 45, height: 490 },
    mobile: { left: -35, top: 55, height: 510 },
  },
  {
    desktop: { left: 10, top: 32, height: 490 },
    mobile: { left: -5, top: 45, height: 510 },
  },
  {
    desktop: { left: 38, top: 25, height: 620 },
    mobile: { left: 42, top: 32, height: 665 },
  },
  {
    desktop: { left: -15, top: 32, height: 500 },
    mobile: { left: -25, top: 50, height: 535 },
  },
];

// Logical canvas pixels. Portrait is separately authored at 1080 × 1920.
export const PORTRAITS = [
  {
    look: "light",
    main: "crew/filip-wide.webp",
    desktop: { left: 835, top: 116, height: 1260 },
    mobile: { left: 270, top: 390, height: 1480 },
    close: {
      desktopX: 760,
      desktopY: 64,
      desktopHeight: 1220,
      mobileX: -100,
      mobileY: 310,
      mobileHeight: 1350,
    },
    nameSize: 115,
    mobileNameSize: 82,
  },
  {
    look: "diagonal",
    main: "crew/pal-andre-wide.webp",
    desktop: { left: 965, top: 65, height: 1260 },
    mobile: { left: 240, top: 340, height: 1500 },
    close: {
      desktopX: 970,
      desktopY: 115,
      desktopHeight: 1130,
      mobileX: -80,
      mobileY: 390,
      mobileHeight: 1280,
    },
    nameSize: 102,
    mobileNameSize: 65,
  },
  {
    look: "precision",
    main: "crew/hans-kristian.webp",
    desktop: { left: 870, top: 130, height: 1100 },
    mobile: { left: 130, top: 400, height: 1430 },
    close: {
      desktopX: 1000,
      desktopY: 80,
      desktopHeight: 1210,
      mobileX: 50,
      mobileY: 330,
      mobileHeight: 1390,
    },
    nameSize: 156,
    mobileNameSize: 123,
  },
  {
    look: "spotlight",
    main: "crew/havard.webp",
    desktop: { left: 925, top: 116, height: 1160 },
    mobile: { left: 210, top: 380, height: 1450 },
    close: {
      desktopX: 850,
      desktopY: 80,
      desktopHeight: 1200,
      mobileX: -30,
      mobileY: 340,
      mobileHeight: 1330,
    },
    nameSize: 180,
    mobileNameSize: 155,
  },
] as const;

export const frames = (seconds: number, fps: number) =>
  Math.round(seconds * fps);
export const splitName = (driver: Driver) => {
  const parts = driver.fullName.split(" ");
  return {
    first: parts.slice(0, -1).join(" "),
    last: parts.at(-1)!.toUpperCase(),
  };
};
