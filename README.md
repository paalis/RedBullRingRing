# RedBullRingRing

Nettsiden for turen vår til Østerrikes Grand Prix på Red Bull Ring, juli 2027. Fire kamerater fra Trondheim, Oslo og Kristiansand, via Wien og Graz til Spielberg.

## Struktur

- `site/`: selve nettsiden (statisk HTML/CSS/JS, uten byggesteg). Det er denne mappen Vercel publiserer.
  - `app.js`: øverst ligger tripdata som er lett å endre: løpsstart, teamet (`CREW`), flyreiser (`FLIGHTS`), overnatting (`STAYS`), leiebil (`CAR`), pakkeliste og teamradio-sitater.
  - `intro.js`: vanlig HTML-videoavspilling med brukerinitiert lyd, pause, hopp over, gjentatt avspilling, tastatur og fallback.
  - `assets/intro-desktop.mp4` og `assets/intro-mobile.mp4`: ferdige Remotion-filmer med synkron lyd; bare valgt variant lastes når brukeren starter.
  - `assets/intro-poster-desktop.jpg` og `assets/intro-poster-mobile.jpg`: statiske plakatbilder før avspilling.
- `video/`: redigerbare Remotion-komposisjoner, lydkilde, sceneplan og skript for å generere nettsidens intro på nytt.
- `brag-output/`: den tidligere introen og historisk kildemateriale fra `/brag-slim`, beholdt som referanse. Dette inkluderer `brag.mp4`, plakatbilde, plan og skripter i `work/`. Den nye nettsideintroen genereres fra `video/`.

## Lokalt

```sh
cd site && python3 -m http.server 8000
```

## Video med Remotion

`video/` inneholder den redigerbare introen. Den presenterer de fire
turdeltakerne med nettstedets bilder og fonter, og følger det vedlagte
lydsporet i **52,10 sekunder**. F1-utklippene er visuelle referanser.

Forhåndsvis begge komposisjoner i Remotion Studio:

```sh
cd video
npm ci
npm run dev
```

Generer nettsidens to MP4-filer og posterbilder på nytt:

```sh
npm run render:intro
```

Kommandoen skriver `intro-desktop.mp4`, `intro-mobile.mp4` og tilsvarende
`intro-poster-*.jpg` til `site/assets/`, etter at alle valgte renderinger har
lyktes. Desktop er 1920 × 1080, mobil er separat komponert i 720 × 1280;
begge er 30 fps. Nettsiden velger én variant og starter lyd etter et tydelig
brukerklikk, med mulighet for å hoppe over og spille igjen.

Se [video/README.md](video/README.md) for alle kommandoer, nettleservalg,
redigering, komprimering og kontrollstatus. Se
[video/INTRO_PLAN.md](video/INTRO_PLAN.md) for musikalske markører og scener.
Klargjøringen gjenskaper lyd og prosjektdata lokalt fra beholdte kildefiler.
En rendering publiserer ikke nettsiden.

## Publisering

Vercel-prosjektet har `site/` som rotmappe. Push til `main` publiserer automatisk.

## Planleggingstavla (Firebase)

Overnatting og leiebil kan planlegges rett på siden: legg til forslag, stem, merk som booket og huk av punkter.

- Data ligger i Firestore i Firebase-prosjektet `rbr27-70136e6c`. Koden er `site/plan.js`, og Firebase-biblioteket er bundlet i `site/assets/vendor/firebase.js`.
- Alle kan se planen. For å skrive må man velge navn og oppgi lagkoden. Koden ligger i `config/team` i databasen og kan ikke leses fra nettsiden.
- Sikkerhetsreglene ligger i `firebase/firestore.rules`. Publiser endringer med `firebase deploy --only firestore:rules`.
