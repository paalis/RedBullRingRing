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
  track: 9.96, // kraftig slag → banen
  stats: [10.41, 11.17],
  punch: [11.62, 12.06, 12.38], // «4 kamerater.» «3 byer.» «1 løp.»
  date: 12.9,
};

// Bilen suser over skjermen rett før musikken tar av, og teamintroen starter på slaget ved 15,36 s.
export const CAR = { from: 14.15, peak: 15.2 };
export const TEAM_AT = 15.36;

// Teamintroen: tittel én takt, så tre takter per fører: bilklipp (to kutt i slaget før takten), nærbilde,
// hovedscene, profil og vid vinkel. Line-upen kommer på takten etter siste fører.
export const DRIVERS_AT = TEAM_AT + 4 * BEAT; // 17,76
export const DRIVER_LEN = 12 * BEAT; // 7,2

export const teamSchedule = (drivers: number): [number, string][] => {
  const lineup = DRIVERS_AT + drivers * DRIVER_LEN; // 46,56
  return [
    [TEAM_AT, "title"],
    ...Array.from({ length: drivers }, (_, i) => {
      const t = DRIVERS_AT + i * DRIVER_LEN;
      return [
        [t - BEAT, `t${i}a`],
        [t - BEAT / 2, `t${i}b`],
        [t, `d${i}a`],
        [t + 2 * BEAT, `d${i}`],
        [t + 6 * BEAT, `d${i}b`],
        [t + 8 * BEAT, `d${i}c`],
      ] as [number, string][];
    }).flat(),
    [lineup - BEAT, `t${drivers}a`],
    [lineup - BEAT / 2, `t${drivers}b`],
    [lineup, "grid"],
  ];
};

export const FADE_OUT = 1.2; // siste sekunder tones til svart før nettsiden tar over
