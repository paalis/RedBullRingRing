# RedBullRingRing

Nettsiden for turen vår til Østerrikes Grand Prix på Red Bull Ring, juli 2027. Fire kamerater fra Trondheim, Oslo og Kristiansand, via Wien og Graz til Spielberg.

## Struktur

- `site/`: selve nettsiden (statisk HTML/CSS/JS, uten byggesteg). Det er denne mappen Vercel publiserer.
  - `app.js`: øverst ligger tripdata som er lett å endre: løpsstart, teamet (`CREW`), flyreiser (`FLIGHTS`), overnatting (`STAYS`), leiebil (`CAR`), pakkeliste og teamradio-sitater.
  - `assets/intro.mp4`: introsnutten som spilles i toppen av siden.
- `brag-output/`: introvideoen i full oppløsning (`brag.mp4`), plakatbilde, plan og delingstekst, laget med `/brag-slim`. Skriptene som lager videoen ligger i `brag-output/work/`. Lydsporet til nettsideintroen (`site/assets/intro-theme.mp3`: introvideoen, horn under teamintroen og motorlyd når bilen kjører over skjermen) lages med `brag-output/work/theme.py`.

## Lokalt

```sh
cd site && python3 -m http.server 8000
```

## Video med Remotion

`video/` er et eget React/TypeScript-prosjekt for å lage og rendre videoer:

```sh
cd video
npm ci
npm run dev
```

Se [video/README.md](video/README.md) for MP4-eksport, stillbilder og kommandoer for Codex-skymiljøet. Startkomposisjonen `RedBullRingIntro` er seks sekunder lang. Nettsidens eksisterende videofiler oppdateres ikke automatisk.

## Publisering

Vercel-prosjektet har `site/` som rotmappe. Push til `main` publiserer automatisk.

## Planleggingstavla (Firebase)

Overnatting og leiebil kan planlegges rett på siden: legg til forslag, stem, merk som booket og huk av punkter.

- Data ligger i Firestore i Firebase-prosjektet `rbr27-70136e6c`. Koden er `site/plan.js`, og Firebase-biblioteket er bundlet i `site/assets/vendor/firebase.js`.
- Alle kan se planen. For å skrive må man velge navn og oppgi lagkoden. Koden ligger i `config/team` i databasen og kan ikke leses fra nettsiden.
- Sikkerhetsreglene ligger i `firebase/firestore.rules`. Publiser endringer med `firebase deploy --only firestore:rules`.
