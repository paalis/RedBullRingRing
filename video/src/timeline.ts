// Tidslinje i sekunder, målt fra lydfilen site/assets/f1-theme.m4a (52,15 s).
// Hovedpartiet går i ~100 BPM: ett slag er 0,6 s og en takt (fire slag) 2,4 s, med første slag ved 15,36 s.
// Åpningen følger de tydelige anslagene før det.
export const FPS = 30;
export const DURATION = 52.1;
export const BEAT = 0.6;

export const OPENING = {
  lights: [1.57, 2.02, 2.46, 3.68, 4.43], // fem startlys, de fire første på anslag i musikken
  lightsOut: 5.17, // stort slag → ruten
  cities: [5.47, 5.77, 6.07, 6.36, 6.82, 7.27], // TRD, OSL, KRS, Wien, Graz, Spielberg
  numbers: [9.96, 10.41, 10.87, 11.17], // førernumrene 7, 16, 44, 81 smeller inn, ett per slag
  dateWords: [11.62, 12.06, 12.38], // «8.–12.» «JULI» «2027»
  // Etter førerne (fra 39,96 s, der musikken bygger seg opp igjen, ~0,45 s per slag): banen og punchlinen.
  track: 39.96,
  stats: [40.41, 40.87],
  punchWipe: 42.36,
  punch: [42.82, 43.27, 43.72], // «4 kamerater.» «3 byer.» «1 løp.»
  date: 44.77,
};

// Bilsekvensen: startgrid i den rolige oppbyggingen, tre raske nærbilder, så suser bilen over skjermen på
// vroom-lyden i musikken (anslag 14,80 s, topp 14,88 s). Etterpå er det nesten stille til trommene ved 15,36 s.
export const CAR = { from: 13.6, wheel: 14.2, nose: 14.39, cockpit: 14.58, vroom: 14.78, peak: 14.88, after: 15.08 };
export const TEAM_AT = 15.36;

// Teamintroen begynner rett på førerne ved 15,36 s (bilsekvensen er overgangen inn) og er ferdig på markeringen
// ved 39,96 s (41 slag): Filip får 11 slag (ingen bilklipp foran, de har vi nettopp sett), de andre 10.
// Hver fører: bilklipp (to kutt i slaget før), nærbilde, hovedscene, profil og vid vinkel. Tider i slag.
// Deretter kommer banen og punchlinen (Opening), og line-upen på 46,56 s med bilklipp foran.
const FIRST = { beats: 11, close: 0, main: 2, profile: 6, wide: 8 };
const NEXT = { beats: 10, close: 0, main: 2, profile: 5, wide: 7 };
export const DRIVERS_END = TEAM_AT + 41 * BEAT; // 39,96
export const LINEUP_AT = 46.56;

export const teamSchedule = (drivers: number): [number, string][] => {
  const out: [number, string][] = [];
  let t = TEAM_AT;
  for (let i = 0; i < drivers; i++) {
    const p = i === 0 ? FIRST : NEXT;
    if (i > 0) out.push([t - BEAT, `t${i}a`], [t - BEAT / 2, `t${i}b`]);
    out.push([t + p.close * BEAT, `d${i}a`], [t + p.main * BEAT, `d${i}`], [t + p.profile * BEAT, `d${i}b`], [t + p.wide * BEAT, `d${i}c`]);
    t += p.beats * BEAT;
  }
  out.push([DRIVERS_END, "pause"]); // ingen teamscene mens banen og punchlinen vises
  out.push([LINEUP_AT - BEAT, `t${drivers}a`], [LINEUP_AT - BEAT / 2, `t${drivers}b`], [LINEUP_AT, "grid"]);
  return out;
};

export const FADE_OUT = 1.2; // siste sekunder tones til svart før nettsiden tar over
