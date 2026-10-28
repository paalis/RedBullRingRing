# Introfilmen (Remotion)

Introfilmen til nettsiden, synket til F1-temaet (`site/assets/f1-theme.m4a`, 52 s):

| Tid | Hva |
|---|---|
| 0–5,2 s | Startlys tennes på anslagene i musikken, «lights out» på det store slaget |
| 5,2–10 s | Ruten: Trondheim, Oslo og Kristiansand → Wien → Graz → Spielberg |
| 10–11,6 s | Red Bull Ring, 71 runder, 4,318 km |
| 11,6–14 s | «4 kamerater. 3 byer. 1 løp.», datoen og lys som går grønt |
| 14,15–15,4 s | Red Bull-bilen suser over skjermen og blinker over i teamintroen |
| 15,36 s | Musikken tar av: «Line-up» |
| 17,8–46,6 s | Fire førere, tre takter hver: bilklipp, nærbilde, hovedscene, profil og vid vinkel |
| 46,6–52 s | Line-up-plakaten, så tones filmen ut |

Hovedpartiet går i ~100 BPM (ett slag = 0,6 s), og alle tider ligger i `src/timeline.ts`.

## Oppbygning

- `src/Intro.tsx`: komposisjonen (musikk, åpning, bil, teamintro og uttoning).
- `src/Opening.tsx` og `src/opening.css`: åpningsscenene fra den første introvideoen, oppdatert per frame.
- `src/CarPass.tsx`: bilen som overgang.
- `src/TeamIntro.tsx`, `src/teamMarkup.ts` og `src/team-intro.css`: teamintroen. Scenene bruker CSS-keyframes,
  som spoles til riktig tid for hver frame og skrives som statisk stil (se kommentaren i `TeamIntro.tsx`).
- `src/crew.ts`: teamet (samme som `CREW` i `site/app.js`). Bildene hentes fra `site/assets/crew/`.

Bilder, fonter og musikk leses rett fra `site/assets` (satt i `remotion.config.ts`).

## Forhåndsvisning og rendering

```bash
npm install
npx remotion studio                       # forhåndsvisning i nettleseren
npx remotion render Intro ../site/assets/intro.mp4 --codec=h264 --crf=24 --audio-bitrate=128k
npx remotion render IntroMobile ../site/assets/intro-mobile.mp4 --codec=h264 --crf=25 --audio-bitrate=128k --scale=2
node scripts/stills.mjs Intro /tmp/stills 15.5 20 30   # stillbilder for kontroll
```

Mobilutgaven er komponert på 360 × 640 og renderes med `--scale` til 720 × 1280.
Studioet viser scenene i studiovinduets størrelse; renderingen bruker komposisjonens mål (vw/vh i CSS-en).
