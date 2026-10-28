import { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MAP_SVG, TRACK_SVG } from "./svg";
import { CREW } from "./crew";
import { LINEUP_AT, OPENING } from "./timeline";
import "./opening.css";

const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);
// 0→1 mellom a og b (sekunder), med valgfri easing.
const prog = (t: number, a: number, b: number, ease: (x: number) => number = (x) => x) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

const O = OPENING;
const SCENES = { s1: [0, O.lightsOut], s2: [O.lightsOut, O.numbers[0]], s5: [O.numbers[0], O.track], s3: [O.track, O.punchWipe], s4: [O.punchWipe, Infinity] } as const;
const WIPES = [O.punchWipe];
const FLEX = ["s1", "s4", "s5"];

const markup = () => `
  <section class="scene" id="s1">
    <div class="gantry"><i></i><i></i><i></i><i></i><i></i></div>
    <p class="kick"><span class="flag-at"></span>Østerrikes Grand Prix · Spielberg</p>
  </section>
  <section class="scene" id="s2">
    <div class="mapwrap">${MAP_SVG.replace('viewBox="0 0 640 600"', 'viewBox="70 15 590 590"')}</div>
  </section>
  <section class="scene" id="s5">
    <div class="bignum"><i class="bar"></i><b></b><span></span></div>
    <div class="numrow">${CREW.map((d) => `<i style="--team:${d.team}">${d.number}</i>`).join("")}</div>
    <div class="dw"><span class="skew">8.–12.</span><span class="skew">juli</span><span class="skew red">2027</span></div>
    <div class="kerbbar"></div>
  </section>
  <section class="scene" id="s3">
    <div class="trackwrap">${TRACK_SVG}</div>
    <div class="copy">
      <p class="kick" style="color:var(--red)">Spielberg, Steiermark</p>
      <h2 class="big"><span class="skew">Red Bull Ring</span></h2>
      <div class="stat"><b>71</b><span>runder</span></div>
      <div class="stat"><b>4,318</b><span>km per runde</span></div>
    </div>
  </section>
  <section class="scene" id="s4">
    <div class="lightsrow"><i></i><i></i><i></i><i></i><i></i></div>
    <h1 class="big"><span class="skew">4 kamerater.</span><span class="skew">3 byer.</span><span class="skew red">1 løp.</span></h1>
    <div class="date"><span class="flag-at"></span><b>8.–12. juli 2027</b></div>
    <div class="brandbox"><span class="brand-mark">RBR</span><span class="brand-year">'27</span></div>
    <div class="kerbbar"></div>
  </section>
  <div class="wipe"></div>`;

// Scenene fra den første introvideoen, lagt på anslagene i F1-temaet: startlys, ruten og førernumrene med datoen
// i åpningen, banen og «4 kamerater. 3 byer. 1 løp.» etter førerne. `offset` er filmtiden når sekvensen starter.
// Scenene er SVG/HTML som oppdateres direkte for hver frame (samme oppskrift som den gamle render(t)).
export const Opening: React.FC<{ offset?: number }> = ({ offset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = offset + frame / fps;
  const portrait = height > width;
  const stageW = portrait ? 1080 : 1920;
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(markup, []);

  useLayoutEffect(() => {
    const root = ref.current!;
    const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector(s) as unknown as T;
    const $$ = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll(s)] as unknown as T[];

    // Engangsoppsett: masker som «tegner» rutene, og målbar banelinje.
    if (!root.querySelector("#s2 mask")) {
      const NS = "http://www.w3.org/2000/svg";
      const mapSvg = $<SVGSVGElement>("#s2 svg");
      const defs = mapSvg.querySelector("defs")!;
      $$<SVGPathElement>("#s2 .route").forEach((r, i) => {
        const m = document.createElementNS(NS, "mask");
        m.id = `rm${i}`;
        m.setAttribute("maskUnits", "userSpaceOnUse");
        const p = document.createElementNS(NS, "path");
        for (const [k, v] of [["d", r.getAttribute("d")!], ["fill", "none"], ["stroke", "#fff"], ["stroke-width", "24"], ["pathLength", "1"], ["stroke-dasharray", "1 1"]]) p.setAttribute(k, v);
        m.append(p);
        defs.append(m);
        r.setAttribute("mask", `url(#rm${i})`);
      });
      const line = $<SVGPathElement>("#s3 .track-line");
      line.setAttribute("pathLength", "1");
      line.setAttribute("stroke-dasharray", "1 1");
    }

    for (const [id, [a, b]] of Object.entries(SCENES)) $(`#${id}`).style.display = t >= a && t < b ? (FLEX.includes(id) ? "flex" : "block") : "none";

    // 1 · Startlys på anslagene, sakte zoom inn
    $$("#s1 .gantry i").forEach((l, i) => l.classList.toggle("on", t >= O.lights[i]));
    $("#s1").style.transform = `scale(${1 + 0.06 * prog(t, 0, O.lightsOut)})`;
    $("#s1 .kick").style.opacity = String(prog(t, 0.3, 1.2, easeOut));

    // 2 · Ruten: byene og flyrutene tegnes inn på hvert slag
    const cities = $$<SVGGElement>("#s2 .city");
    const masks = $$<SVGPathElement>("#s2 mask path");
    const [trd, osl, krs, vie, graz, rbr] = O.cities;
    $("#s2 .mapwrap").style.transform = `scale(${1.04 - 0.04 * prog(t, O.lightsOut, O.track, easeOut)})`;
    [trd, osl, krs].forEach((at, i) => {
      cities[i].style.opacity = String(prog(t, at, at + 0.2, easeOut));
      masks[i].setAttribute("stroke-dashoffset", String(1 - prog(t, at, at + 0.9, easeInOut)));
    });
    cities[3].style.opacity = String(prog(t, vie, vie + 0.2, easeOut));
    masks[3].setAttribute("stroke-dashoffset", String(1 - prog(t, vie, graz, easeInOut)));
    cities[4].style.opacity = String(prog(t, graz, graz + 0.2, easeOut));
    masks[4].setAttribute("stroke-dashoffset", String(1 - prog(t, graz, rbr, easeInOut)));
    cities[5].style.opacity = String(prog(t, rbr, rbr + 0.2, easeOut));
    $$<SVGPathElement>("#s2 .route-fly").forEach((r) => (r.style.strokeDashoffset = String(-30 * ((t - O.lightsOut) / 1.4))));

    // Førernumrene: ett stort nummer per slag i lagfargen, så alle fire på rad og datoen ord for ord
    const n = O.numbers.filter((at) => t >= at).length - 1;
    const big = $("#s5 .bignum");
    const inDate = t >= O.dateWords[0];
    if (n >= 0 && !inDate) {
      const d = CREW[n];
      const p = prog(t, O.numbers[n], O.numbers[n] + 0.18, easeOut);
      big.style.display = "grid";
      big.style.setProperty("--team", d.team);
      big.querySelector("b")!.textContent = String(d.number);
      big.querySelector("span")!.textContent = d.code;
      big.style.opacity = String(p);
      big.querySelector("b")!.style.transform = `skewX(-8deg) scale(${1.45 - 0.45 * p})`;
      (big.querySelector(".bar") as HTMLElement).style.transform = `skewX(-18deg) translateX(${-120 + 120 * p}%)`;
    } else big.style.display = "none";
    $$("#s5 .numrow i").forEach((el, i) => {
      const p = prog(t, O.dateWords[0] + i * 0.05, O.dateWords[0] + 0.25 + i * 0.05, easeOut);
      el.style.opacity = String(p);
      el.style.transform = `skewX(-8deg) translateY(${-40 * (1 - p)}px)`;
    });
    $$("#s5 .dw span").forEach((s, i) => {
      const p = prog(t, O.dateWords[i], O.dateWords[i] + 0.2, easeOut);
      s.style.opacity = String(p);
      s.style.transform = `skewX(-8deg) translateX(${-120 * (1 - p)}px)`;
    });
    $("#s5").style.transform = `scale(${1 + 0.05 * prog(t, O.dateWords[0], O.dateWords[0] + 2)})`;

    // 3 · Banen tegnes, bilen kjører runder, tallene smeller inn på slagene
    const line = $<SVGPathElement>("#s3 .track-line");
    line.setAttribute("stroke-dashoffset", String(1 - prog(t, O.track, O.track + 0.7, easeInOut)));
    const lap = 2.4;
    const u3 = Math.max(0, t - O.track - 0.3);
    const pt = line.getPointAtLength(((u3 % lap) / lap) * line.getTotalLength());
    const car = $<SVGCircleElement>("#s3 .car");
    car.setAttribute("cx", String(pt.x));
    car.setAttribute("cy", String(pt.y));
    car.style.opacity = String(prog(t, O.track + 0.25, O.track + 0.4));
    $("#s3 .copy").style.opacity = String(prog(t, O.track, O.track + 0.3, easeOut));
    $$("#s3 .stat").forEach((s, i) => {
      const p = prog(t, O.stats[i], O.stats[i] + 0.22, easeOut);
      s.style.opacity = String(p);
      s.style.transform = `scale(${1.15 - 0.15 * p})`;
      s.style.transformOrigin = "left center";
    });

    // 4 · «4 kamerater. 3 byer. 1 løp.» på tre slag, så dato og lys som går grønt før bilen kommer
    $$("#s4 h1 span").forEach((s, i) => {
      const p = prog(t, O.punch[i], O.punch[i] + 0.22, easeOut);
      s.style.opacity = String(p);
      s.style.transform = `skewX(-8deg) translateX(${-120 * (1 - p)}px)`;
    });
    const d = prog(t, O.date, O.date + 0.3, easeOut);
    $("#s4 .date").style.opacity = String(d);
    $("#s4 .date").style.transform = `translateY(${20 * (1 - d)}px)`;
    $("#s4 .brandbox").style.opacity = String(prog(t, O.date, O.date + 0.4, easeOut));
    $$("#s4 .lightsrow i").forEach((l, i) => {
      const green = t >= O.date + 0.1 + i * 0.1;
      l.style.background = green ? "#00d26a" : "#2a0a0a";
      l.style.boxShadow = green ? "inset 0 0 0 5px #111, 0 0 24px #00d26a" : "inset 0 0 0 5px #111";
    });
    $("#s4").style.transform = `scale(${1 + 0.04 * prog(t, O.punchWipe, LINEUP_AT)})`;

    // Kantstein-visker over kuttene
    const wipe = $(".wipe");
    const cut = WIPES.find((c) => t > c - 0.35 && t < c + 0.35);
    wipe.style.display = cut === undefined ? "none" : "block";
    if (cut !== undefined) wipe.style.transform = `translateX(${-5000 + (stageW + 5000) * prog(t, cut - 0.35, cut + 0.35, easeInOut)}px) skewX(-18deg)`;
  }, [t, stageW]);

  return (
    <AbsoluteFill style={{ background: "#0b0b10" }}>
      <div
        ref={ref}
        className={`op${portrait ? " is-portrait" : ""}`}
        style={{ transform: `scale(${width / stageW})` }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </AbsoluteFill>
  );
};
