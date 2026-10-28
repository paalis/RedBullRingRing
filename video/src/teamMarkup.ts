// Scenene i teamintroen som HTML-strenger, flyttet fra nettsiden (site/app.js). Klassenavnene matcher team-intro.css.
// Animasjonene er CSS-keyframes; TeamIntro.tsx spoler dem til riktig tidspunkt for hver frame.
import { staticFile } from "remotion";
import { CREW, LINEUP, splitName, type Driver } from "./crew";

// ---------- Teamintro: korte bilklipp mellom førerne, to kutt per overgang ----------
const SHOTS = [["tunnel", "wing"], ["sketch", "wheel"], ["nose", "wing tr-wing-red"], ["flow", "rear"], ["wheel tr-wheel-2", "zoom"]];
const FLOW_LINES = [0, 1, 2, 3, 4, 5, 6].map((k) => {
  const y = 150 + k * 22;
  return `<path d="M-20 ${y + 60} C 260 ${y + 60}, 420 ${y - 40}, 640 ${y - 70} S 1000 ${y - 30}, 1240 ${y - 10}" style="--k:${k}"/>`;
}).join("");
const LEDS = (x: number, y0: number, n: number, step: number) => Array.from({ length: n }, (_, k) => `<circle class="tr-led" cx="${x}" cy="${y0 + k * step}" r="${step * 0.36}" style="--n:${k}"/>`).join("");
const RING = (cx: number, cy: number, r: number, n: number) => Array.from({ length: n }, (_, k) => {
  const a = (k / n) * Math.PI * 2;
  return `<circle class="tr-led" cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="7" style="--n:${k}"/>`;
}).join("");
// Bakvinge i silhuett: tre vingeblader og endeplate med LED-regnlys.
const WING = `
  <path d="M-60 150 C 400 140 900 120 1115 100 L1125 168 C 900 185 400 215 -60 236Z"/>
  <path d="M-60 296 C 400 286 900 266 1105 236 L1115 298 C 900 328 400 358 -60 378Z"/>
  <path d="M-60 428 C 400 418 900 398 1095 368 L1100 398 C 900 428 400 458 -60 468Z"/>
  <path d="M1122 52 L1168 40 L1172 330 C1162 520 1082 650 962 900 L898 900 C1018 650 1108 520 1118 330Z"/>`;

export function transitionScene(i: number) {
  return SHOTS[i % SHOTS.length].map((kind, k) => shot(kind, `t${i}${"ab"[k]}`)).join("");
}

function shot(kind: string, name: string) {
  const car = `<img class="tr-car" src="${staticFile("car.webp")}" alt="">`;
  const base = kind.split(" ")[0];
  const bodies: Record<string, string> = {
    tunnel: `<div class="tr-floor"></div><i class="tr-strip tr-strip-a"></i><i class="tr-strip tr-strip-b"></i><div class="tr-glow"></div>`,
    sketch: `${car}<div class="tr-redbars"><i></i><i></i></div>`,
    nose: `${car}<div class="tr-smoke"></div>`,
    flow: `${car}<svg class="tr-lines" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="tr-flow-g" x1="0" x2="1"><stop offset="0" stop-color="#ff2a1f"/><stop offset=".55" stop-color="#ffd6d6"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient></defs>
        ${FLOW_LINES}</svg><div class="tr-redfloor"></div>`,
    zoom: `${car}<div class="tr-white"></div>`,
    wing: `<svg class="tr-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${WING}${LEDS(1146, 74, 14, 18)}</svg>`,
    rear: `<svg class="tr-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <g transform="translate(260 40) scale(.62)">${WING}${LEDS(1146, 74, 14, 18)}</g>
        <path d="M250 900 C 330 720 520 650 600 560 C 650 480 700 430 770 430 C 840 430 880 480 920 560 C 1000 650 1150 720 1220 900Z"/>
        <path d="M560 560 L600 330 L630 330 L620 560Z M900 560 L880 330 L910 330 L950 560Z"/>
        <rect x="1240" y="540" width="330" height="420" rx="100"/>
        <rect x="140" y="560" width="230" height="400" rx="80"/>
        ${RING(770, 800, 42, 18)}</svg>`,
    wheel: `<svg class="tr-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs><filter id="tr-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter></defs>
        <ellipse class="tr-tyre" cx="1050" cy="430" rx="560" ry="520"/>
        <ellipse class="tr-rim-glow" cx="1000" cy="450" rx="400" ry="370" filter="url(#tr-blur)"/>
        <ellipse class="tr-rim" cx="1000" cy="450" rx="400" ry="370"/>
        <g class="tr-spin"><ellipse class="tr-dash" cx="1000" cy="450" rx="350" ry="322"/></g>
        <g class="tr-arms"><rect x="-200" y="210" width="1500" height="120" transform="rotate(-18 550 270)"/>
          <rect x="-200" y="520" width="1500" height="90" transform="rotate(-12 550 565)"/>
          <rect x="560" y="-100" width="170" height="1100" transform="rotate(24 645 450)"/>
          <path class="tr-edge" d="M690 -60 L1110 950" /></g></svg>`,
  };
  const body = bodies[base];
  return `<section class="ti-scene tr tr-${kind}" data-scene="${name}" aria-hidden="true">${body}</section>`;
}

// Nærbilde før hovedscenen: mørkt, rødt kantlys, store bokstaver bak ansiktet (som Verstappen-introen).
function closeupScene(d: Driver, i: number) {
  const L = splitName(d).last.toUpperCase();
  return `
    <section class="ti-scene tz" data-scene="d${i}a" style="--team:${d.team}">
      <div class="tz-word"><span>${L.slice(0, 3)}</span></div>
      <img class="tz-face is-tight" src="${d.close}" alt="">
      <i class="tx-tag" style="right:6%;top:9%">${d.number}</i>
    </section>`;
}

// Profil etter hovedscenen: speilvendt nærbilde i svart-hvitt med lagfarge, stort nummer i omriss og skannelinjer.
function profileScene(d: Driver, i: number) {
  const { first, last } = splitName(d);
  return `
    <section class="ti-scene tp" data-scene="d${i}b" style="--team:${d.team}">
      <div class="tp-num"><span>${d.number}</span></div>
      <img class="tp-face" src="${d.photo}" alt="">
      <div class="tp-tint"></div><div class="tp-scan"></div>
      <div class="tp-name">
        <span class="tx-first">${first}</span>
        <span class="tx-last">${last.toUpperCase()}</span>
        <span class="tp-meta">${d.role.toUpperCase()} · ${d.code}</span>
      </div>
    </section>`;
}

// Vid vinkel etter hovedscenen: hele føreren på en opplyst plattform, navnet i omriss og nøkkeltall.
function wideScene(d: Driver, i: number) {
  const L = splitName(d).last.toUpperCase();
  return `
    <section class="ti-scene tw" data-scene="d${i}c" style="--team:${d.team}">
      <div class="tw-cone"></div>
      <div class="tw-word"><span>${L}</span></div>
      <div class="tw-stage"></div>
      <img class="tw-driver" src="${d.wide}" alt="">
      <div class="tw-stats"><b>${d.number}</b><span>${d.role.toUpperCase()}</span><span>${d.home.toUpperCase()}</span></div>
      <i class="tx-tag" style="left:6%;top:9%">${d.code}</i>
    </section>`;
}

// ---------- Teamintro: én scene per fører, hver i sin egen stil (som F1-sesongens førerpresentasjoner) ----------
const SCENE_STYLES = ["studio", "echo", "diagonal", "corridor"];

function driverScene(d: Driver, i: number) {
  const { first, last } = splitName(d);
  const L = last.toUpperCase();
  const style = SCENE_STYLES[i % SCENE_STYLES.length];
  const img = (cls: string) => `<img class="${cls}" src="${d.photo}" alt="">`;
  const tag = (pos: string) => `<i class="tx-tag" style="${pos}">${d.number}</i>`;
  const home = `<span class="tx-home">${d.home.toUpperCase()}</span>`;
  // Etternavnet med to bokstaver i omriss på midten (der føreren står foran teksten).
  const mid = Math.max(1, Math.floor(L.length / 2) - 1);
  const outlined = `${L.slice(0, mid)}<em>${L.slice(mid, mid + 2)}</em>${L.slice(mid + 2)}`;
  // De to siste bokstavene lyser rødt først (som i F1-presentasjonene), så blir de hvite.
  const tail = `${L.slice(0, -2)}<i class="tx-tail">${L.slice(-2)}</i>`;
  const name = (lastHtml = tail, extra = "") => `
    <div class="tx-name">
      <span class="tx-first">${first}</span>
      <span class="tx-last" data-t="${L}">${lastHtml}</span>${extra}
    </div>`;
  const bodies: Record<string, string> = {
    studio: `
      <div class="tx-big tx-big-top"><span>${L} ${L} ${L}</span></div>
      <div class="tx-big tx-big-bottom"><span>${L} ${L} ${L}</span></div>
      ${tag("left:12%;top:7%")}${tag("right:8%;top:7%")}${tag("right:8%;top:28%")}${tag("left:12%;bottom:12%")}
      ${img("tx-driver")}
      ${name(outlined)}
      ${home}`,
    echo: `
      <div class="tx-outline"><span>${L.slice(0, 3)}</span></div>
      ${img("tx-ghost tx-ghost-l")}${img("tx-ghost tx-ghost-r")}
      ${img("tx-driver")}
      ${tag("left:6%;top:9%")}${tag("right:6%;top:9%")}${tag("right:6%;top:30%")}${tag("left:6%;bottom:12%")}
      <span class="tx-home" style="left:6%;top:50%">${d.home.toUpperCase()}</span>
      ${name()}`,
    diagonal: `
      <div class="tx-flash"><span>${L}</span></div>
      <div class="tx-tilt">
        <div class="tx-floor"></div>
        <div class="tx-band"></div>
        ${img("tx-reflect")}${img("tx-driver")}
        ${name(tail, `<span class="tx-meta"><b>${d.number}</b>${d.home.toUpperCase()}</span>`)}
      </div>`,
    corridor: `
      <svg class="tx-hall" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="tx-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3.2" fill="#ff2a1f" opacity=".55"/></pattern>
          <linearGradient id="tx-wall-l" x1="0" x2="1"><stop offset="0" stop-color="#5a0004"/><stop offset="1" stop-color="#170003"/></linearGradient>
          <linearGradient id="tx-wall-r" x1="1" x2="0"><stop offset="0" stop-color="#7a0006"/><stop offset="1" stop-color="#170003"/></linearGradient>
        </defs>
        <rect width="1600" height="900" fill="#100002"/>
        <path d="M0 0 L560 260 L560 640 L0 900Z" fill="url(#tx-wall-l)"/><path d="M0 0 L560 260 L560 640 L0 900Z" fill="url(#tx-dots)" opacity=".7"/>
        <path d="M1600 0 L1040 260 L1040 640 L1600 900Z" fill="url(#tx-wall-r)"/><path d="M1600 0 L1040 260 L1040 640 L1600 900Z" fill="url(#tx-dots)"/>
        <path d="M0 0 L1600 0 L1040 260 L560 260Z" fill="#2a0004"/>
        <path d="M0 900 L1600 900 L1040 640 L560 640Z" fill="#1e0003"/>
        <rect x="560" y="260" width="480" height="380" fill="#a00008"/>
        <path class="tx-laser" d="M380 0 L640 330"/><path class="tx-laser" d="M1480 0 L1080 380"/>
      </svg>
      <div class="tx-ghostword"><span>${L.slice(0, 2)}</span></div>
      ${img("tx-driver")}
      ${name()}
      <span class="tx-home" style="left:7%;top:51%">${d.home.toUpperCase()}</span>
      ${tag("left:7%;top:26%")}${tag("left:7%;bottom:18%")}`,
  };
  const body = bodies[style];
  return `<section class="ti-scene ti-driver tx tx-${style}" data-scene="d${i}" style="--team:${d.team}">${body}</section>`;
}

export function teamIntroMarkup() {
  return `
    <div class="ti-stage">
      <section class="ti-scene ti-title" data-scene="title">
        <div class="ti-stripes" aria-hidden="true"><i></i><i></i><i></i></div>
        <p class="ti-kicker">Østerrikes Grand Prix · Spielberg 2027</p>
        <h2>Line-up</h2>
        <p class="ti-sub"><span class="brand-mark">RBR</span><span class="brand-year">'27</span></p>
      </section>
      ${CREW.map((d, i) => transitionScene(i) + closeupScene(d, i) + driverScene(d, i) + profileScene(d, i) + wideScene(d, i)).join("")}
      ${transitionScene(CREW.length)}
      <section class="ti-scene ti-grid" data-scene="grid">
        <div class="tg-bar" aria-hidden="true"><i></i><span><span class="brand-mark">RBR</span><span class="brand-year">'27</span></span><i></i></div>
        <div class="tg-row">
          ${LINEUP.map((idx, pos) => {
            const d = CREW[idx];
            const inner = pos === 1 || pos === 2;
            return `
            <figure class="tg-driver${inner ? " is-front" : ""}" style="--i:${pos}">
              <img src="${d.photo}" alt="${d.fullName}">
            </figure>`;
          }).join("")}
        </div>
        <div class="ti-grid-title"><p>Østerrikes Grand Prix · 9.–11. juli 2027</p><h2>Team <span class="brand-mark">RBR</span> '27</h2></div>
      </section>
    </div>`;
}

