# Introfilmen (Remotion)

Introfilmen til nettsiden, synket til F1-temaet (`site/assets/f1-theme.m4a`, 52 s):

| Tid | Hva |
|---|---|
| 0–5,2 s | Startlys tennes på anslagene i musikken, «lights out» på det store slaget |
| 5,2–10 s | Ruten: Trondheim, Oslo og Kristiansand → Wien → Graz → Spielberg |
| 10–11,6 s | Førernumrene 7, 16, 44 og 81 smeller inn i lagfargene, ett per slag |
| 11,6–13,6 s | Alle fire numrene på rad, og «8.–12. juli 2027» ord for ord |
| 13,6–14,2 s | Bilen på startgrid: mørk asfalt, rødt motlys, regnlyset blinker |
| 14,2–14,78 s | Tre raske nærbilder: bakhjulet som spinner, nesen, cockpiten |
| 14,8–15,1 s | Bilen suser over skjermen på vroom-lyden (topp 14,88 s): uskarphet, fartsstriper, gnister, risting |
| 15,1–15,36 s | Stillheten: lysstriper og gnister dør ut, hvitt blink inn i teamintroen |
| 15,36–39,96 s | Førerne: Filip 11 slag, de andre 10, med bilklipp, nærbilde, hovedscene, profil og vid vinkel |
| 39,96–42,36 s | Red Bull Ring: banen tegnes, 71 runder og 4,318 km på slagene |
| 42,36–45,96 s | «4 kamerater. 3 byer. 1 løp.» og datoen |
| 46,56–52 s | Line-up-plakaten (bilklipp foran), så tones filmen ut |

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
