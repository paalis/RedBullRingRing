import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { CREW } from "./crew";
import { teamIntroMarkup } from "./teamMarkup";
import { TEAM_AT, teamSchedule } from "./timeline";
import "./team-intro.css";

const SCHEDULE = teamSchedule(CREW.length);
const OUT = 0.35; // så lenge forrige scene glir ut (ti-out i team-intro.css)
const SKIP = new Set(["offset", "computedOffset", "easing", "composite"]);
const kebab = (p: string) => p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Spoler CSS-animasjonene i scenene til `since` sekunder og skriver resultatet som statisk CSS.
// Chromium kjører transform/opacity-animasjoner på compositor-tråden, som ikke får med seg en pause før
// Remotion tar bildet. Derfor leses de beregnede verdiene på hovedtråden og settes fast med animation: none.
function bake(scenes: HTMLElement[], since: number, sheet: HTMLStyleElement) {
  sheet.textContent = "";
  const targets = new Map<string, { el: Element; pseudo: string | null; props: Set<string> }>();
  let n = 0;
  for (const scene of scenes) {
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
  const { fps } = useVideoConfig();
  const t = TEAM_AT + frame / fps;
  const ref = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLStyleElement>(null);
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
    const prev = k > 0 ? SCHEDULE[k - 1][1] : null;
    const since = Math.max(0, t - at);
    sheet.current!.textContent = "";
    const shown: HTMLElement[] = [];
    ref.current!.querySelectorAll<HTMLElement>(".ti-scene").forEach((scene) => {
      const id = scene.dataset.scene;
      const on = id === name;
      const off = id === prev && since < OUT;
      scene.classList.toggle("is-on", on);
      scene.classList.toggle("is-off", off);
      if (on || off) shown.push(scene);
    });
    bake(shown, since, sheet.current!);
  }, [t]);

  return (
    <AbsoluteFill className="rbr">
      <style ref={sheet} />
      <div ref={ref} style={{ position: "absolute", inset: 0 }} dangerouslySetInnerHTML={{ __html: html }} />
    </AbsoluteFill>
  );
};
