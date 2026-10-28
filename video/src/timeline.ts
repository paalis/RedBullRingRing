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

// Bilsekvensen: startgrid i den rolige oppbyggingen, tre raske nærbilder, så suser bilen over skjermen på
// vroom-lyden i musikken (anslag 14,80 s, topp 14,88 s). Etterpå er det nesten stille til trommene ved 15,36 s.
export const CAR = { from: 13.6, wheel: 14.2, nose: 14.39, cockpit: 14.58, vroom: 14.78, peak: 14.88, after: 15.08 };
export const TEAM_AT = 15.36;

// Teamintroen begynner rett på førerne ved 15,36 s (bilsekvensen er overgangen inn). Line-upen kommer på takten
// 46,56 s, 13 takter senere: Filip får fire takter (ingen bilklipp foran, de har vi nettopp sett), de andre tre.
// Hver fører: bilklipp (to kutt i slaget før), nærbilde, hovedscene, profil og vid vinkel. Tider i slag.
const FIRST = { beats: 16, close: 0, main: 4, profile: 10, wide: 13 };
const NEXT = { beats: 12, close: 0, main: 2, profile: 6, wide: 8 };

export const teamSchedule = (drivers: number): [number, string][] => {
  const out: [number, string][] = [];
  let t = TEAM_AT;
  for (let i = 0; i < drivers; i++) {
    const p = i === 0 ? FIRST : NEXT;
    if (i > 0) out.push([t - BEAT, `t${i}a`], [t - BEAT / 2, `t${i}b`]);
    out.push([t + p.close * BEAT, `d${i}a`], [t + p.main * BEAT, `d${i}`], [t + p.profile * BEAT, `d${i}b`], [t + p.wide * BEAT, `d${i}c`]);
    t += p.beats * BEAT;
  }
  out.push([t - BEAT, `t${drivers}a`], [t - BEAT / 2, `t${drivers}b`], [t, "grid"]); // t = 46,56
  return out;
};

export const FADE_OUT = 1.2; // siste sekunder tones til svart før nettsiden tar over
