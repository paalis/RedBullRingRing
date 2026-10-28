import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { CREW } from "./crew";
import { teamIntroMarkup } from "./teamMarkup";
import { TEAM_AT, teamSchedule } from "./timeline";
import "./team-intro.css";

const SCHEDULE = teamSchedule(CREW.length);
const BLEND = 0.45; // overtoning mellom vinkler hos samme fører
const OUT = 0.14; // sekunder før kuttet der bildet begynner å smøres ut (whip/zoom/striper)
const IN = 0.24; // sekunder etter kuttet der neste bilde lander
const smooth = (x: number) => x * x * (3 - 2 * x);

// Overgangen inn til scene j, etter F1-introene: samme fører tones over, inn i bilklippene er en whip-pan
// med bevegelsesuskarphet, og ut av bilklippene lander neste fører via lysstriper eller zoom gjennom bildet.
type Kind = "blend" | "whipX" | "whipY" | "streak" | "zoom" | "cut";
const MOVES = new Set<Kind>(["whipX", "whipY", "streak", "zoom"]);
const driverOf = (n: string) => (/^d(\d)/.exec(n) || [])[1];
function kindAt(j: number): Kind {
  if (j <= 0 || j >= SCHEDULE.length) return "cut";
  const a = SCHEDULE[j - 1][1];
  const b = SCHEDULE[j][1];
  if ([a, b].some((n) => n === "pause" || n === "grid")) return "cut";
  if (driverOf(a) !== undefined && driverOf(a) === driverOf(b)) return "blend";
  if (a.startsWith("t") && b.startsWith("t")) return "cut";
  const i = Number((/\d/.exec(b.startsWith("t") ? b : a) || ["0"])[0]);
  if (b.startsWith("t")) return i % 2 ? "whipX" : "whipY";
  return i % 2 ? "streak" : "zoom";
}
const SKIP = new Set(["offset", "computedOffset", "easing", "composite"]);
const kebab = (p: string) => p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Spoler CSS-animasjonene i scenene til `since` sekunder og skriver resultatet som statisk CSS.
// Chromium kjører transform/opacity-animasjoner på compositor-tråden, som ikke får med seg en pause før
// Remotion tar bildet. Derfor leses de beregnede verdiene på hovedtråden og settes fast med animation: none.
function bake(scenes: [HTMLElement, number][], sheet: HTMLStyleElement) {
  sheet.textContent = "";
  const targets = new Map<string, { el: Element; pseudo: string | null; props: Set<string> }>();
  let n = 0;
  for (const [scene, since] of scenes) {
    for (const a of scene.getAnimations({ subtree: true })) {
      a.pause();
      a.currentTime = since * 1000;
      const effect = a.effect as KeyframeEffect;
      const el = effect.target!;
      const pseudo = effect.pseudoElement;
      if (!(el as HTMLElement).dataset.bk) (el as HTMLElement).dataset.bk = String(n++);
      const key = `${(el as HTMLElement).dataset.bk}${pseudo ?? ""}`;
      const entry = targets.get(key) ?? { el, pseudo, props: new Set<string>() };
      for (const kf of effect.getKeyframes()) for (const p of Object.keys(kf)) if (!SKIP.has(p)) entry.props.add(kebab(p));
      targets.set(key, entry);
    }
  }
  const rules = [...targets.values()].map(({ el, pseudo, props }) => {
    const cs = getComputedStyle(el, pseudo);
    const decl = [...props].map((p) => `${p}: ${cs.getPropertyValue(p)} !important;`).join(" ");
    return `[data-bk="${(el as HTMLElement).dataset.bk}"]${pseudo ?? ""} { animation: none !important; ${decl} }`;
  });
  sheet.textContent = rules.join("\n");
}

// Teamintroen: alle scenene ligger i DOM-en, og for hver frame får riktig scene «is-on» (og forrige «is-off»).
// CSS-animasjonene i de synlige scenene spoles til tiden siden scenen startet, så hver frame er deterministisk.
export const TeamIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = TEAM_AT + frame / fps;
  const ref = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLStyleElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const html = useMemo(() => teamIntroMarkup(), []);
  const [handle] = useState(() => delayRender("Teamintro: laster bilder"));

  useEffect(() => {
    const imgs = [...ref.current!.querySelectorAll("img")];
    Promise.all(imgs.map((im) => im.decode().catch(() => undefined))).then(() => continueRender(handle));
  }, [handle]);

  useLayoutEffect(() => {
    let k = 0;
    while (k + 1 < SCHEDULE.length && SCHEDULE[k + 1][0] <= t + 1e-6) k++;
    const [at, name] = SCHEDULE[k];
    const since = Math.max(0, t - at);
    const prev = k > 0 ? SCHEDULE[k - 1] : null;
    const inKind = kindAt(k);
    const outKind = kindAt(k + 1);
    const toEnd = k + 1 < SCHEDULE.length ? SCHEDULE[k + 1][0] - t : Infinity;
    // 0→1 mens bildet forlater scenen, og 1→0 mens neste bilde lander
    const out = MOVES.has(outKind) && toEnd < OUT ? smooth(1 - toEnd / OUT) : 0;
    const inn = MOVES.has(inKind) && since < IN ? (1 - since / IN) ** 2 : 0;
    const blend = inKind === "blend" && since < BLEND;
    const fade = blend ? smooth(since / BLEND) : 1;
    const px = width / 1920; // uskarphet i komposisjonens piksler (mobilutgaven er smalere)

    let move = { translate: "", scale: "", filter: "", blurX: 0, blurY: 0 };
    const kind = out ? outKind : inn ? inKind : null;
    const m = out || inn;
    if (kind === "whipX" || kind === "whipY") {
      const d = (out ? -out : inn) * 14;
      move.translate = kind === "whipX" ? `${d}% 0` : `0 ${-d}%`;
      move[kind === "whipX" ? "blurX" : "blurY"] = m * 110 * px;
      move.filter = `url(#ti-whip) brightness(${1 + m * 0.25})`;
    } else if (kind === "zoom") {
      move.scale = String(out ? 1 + out * 0.4 : 1 + inn * 0.25);
      move.filter = `blur(${m * 18 * px}px) brightness(${1 + m * 0.5})`;
    } else if (kind === "streak") {
      move.translate = `${out ? -out * 4 : inn * 4}% 0`;
      move.blurX = m * 60 * px;
      move.filter = `url(#ti-whip) brightness(${1 + m * 1.6})`;
    }
    if (blend) move.blurX = (1 - fade) ** 2 * 70 * px; // ny vinkel skyves inn med sideveis uskarphet
    blurRef.current!.setAttribute("stdDeviation", `${move.blurX} ${move.blurY}`);

    // Lysstriper som feier over bildet rundt kuttet
    const streak = (outKind === "streak" && toEnd < OUT) || (inKind === "streak" && since < IN);
    const g = streak ? (outKind === "streak" && toEnd < OUT ? (OUT - toEnd) / (OUT + IN) : (OUT + since) / (OUT + IN)) : 0;
    fxRef.current!.style.display = streak ? "block" : "none";
    fxRef.current!.querySelectorAll<HTMLElement>("i").forEach((bar, i) => {
      bar.style.translate = `${-120 + 240 * smooth(Math.min(1, g * (1 + i * 0.18)))}% 0`;
    });

    sheet.current!.textContent = "";
    const shown: [HTMLElement, number][] = [];
    ref.current!.querySelectorAll<HTMLElement>(".ti-scene").forEach((scene) => {
      const id = scene.dataset.scene;
      const on = id === name;
      const off = !!blend && id === prev![1];
      scene.classList.toggle("is-on", on);
      scene.classList.toggle("is-off", off);
      if (on && blend) {
        // Ny vinkel glir inn over den forrige, som fortsetter å bevege seg under
        scene.style.opacity = String(Math.min(1, fade * 1.8));
        scene.style.filter = "url(#ti-whip)";
        scene.style.translate = `${(1 - fade) * 6}% 0`;
        scene.style.scale = String(1 + (1 - fade) * 0.04);
      } else if (on) {
        scene.style.opacity = "";
        scene.style.filter = move.filter;
        scene.style.translate = move.translate;
        scene.style.scale = move.scale;
      } else {
        scene.style.opacity = scene.style.filter = scene.style.translate = "";
        scene.style.scale = off ? String(1 + fade * 0.03) : "";
      }
      if (on) shown.push([scene, since]);
      if (off) shown.push([scene, t - prev![0]]);
    });
    bake(shown, sheet.current!);
  }, [t, width]);

  return (
    <AbsoluteFill className="rbr">
      <style ref={sheet} />
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="ti-whip" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feGaussianBlur ref={blurRef} stdDeviation="0 0" />
        </filter>
      </svg>
      <div ref={ref} style={{ position: "absolute", inset: 0 }} dangerouslySetInnerHTML={{ __html: html }} />
      <div ref={fxRef} className="ti-fx" aria-hidden>
        <i /><i /><i />
      </div>
    </AbsoluteFill>
  );
};
