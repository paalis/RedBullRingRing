# Red Bull Ring · Remotion

Et eget React/TypeScript-prosjekt for å lage video. Nettsiden i `../site/` har fortsatt sitt eksisterende oppsett.

Oppsettet bygger på Remotions offisielle `remotion-dev/template-empty` (commit `bad1be9984b08a9ee3f3eee1df98765caa04ca11`). Remotion-pakkene har samme, eksakte versjon, og `package-lock.json` låser installasjonen. Node.js 24 anbefales og er validert i Codex-miljøet.

## Installer og forhåndsvis

Kjør fra repoets rot:

```sh
cd video
npm ci
npm run dev
```

Åpne adressen Studio skriver ut, og velg `RedBullRingIntro`. Startvideoen varer i seks sekunder i 1280 × 720, med 30 bilder per sekund og uten lyd.

## Lag MP4 eller stillbilde

Kjør fra `video/`:

```sh
npm run render
npm run still
```

Filene lagres som `out/red-bull-ring-intro.mp4` og `out/poster.png`. `out/` er ignorert av Git. Kommandoene overskriver tidligere eksport med samme navn.

I Codex-skymiljøet brukes installert Chromium, slik at Remotion ikke trenger å laste ned en egen nettleser:

```sh
npm run render -- --browser-executable=/usr/bin/chromium --concurrency=2
npm run still -- --browser-executable=/usr/bin/chromium
```

På andre maskiner kan standardkommandoene laste ned Remotions nettleser ved første eksport. Det krever nettverkstilgang.

## Rediger videoen

- `src/Composition.tsx`: tekst, farger og animasjon. Animasjonen styres av videorammen.
- `src/Root.tsx`: komposisjonens ID, varighet, bildefrekvens og størrelse.
- `src/index.ts`: registrerer prosjektet hos Remotion.
- `remotion.config.ts`: innstillinger for Studio, bygging og eksport.

Legg fremtidige bilder, lyd og videoklipp i `public/` og bruk `staticFile()` fra Remotion for filstier. Startvideoen krever ingen eksterne tjenester eller nøkler. Eksisterende videoer i `../brag-output/` og `../site/assets/` erstattes ikke automatisk av en eksport.

## Kontroller

```sh
npm run lint
npm run build
```

`lint` kjører både ESLint og TypeScript. `build` lager en bundle i `build/`; en MP4 lages med `render`.
