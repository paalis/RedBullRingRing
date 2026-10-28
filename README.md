# RedBullRingRing

Nettsiden for turen vår til Østerrikes Grand Prix på Red Bull Ring, juli 2027. Fire kamerater fra Trondheim, Oslo og Kristiansand, via Wien og Graz til Spielberg.

## Struktur

- `site/`: selve nettsiden (statisk HTML/CSS/JS, uten byggesteg). Det er denne mappen Vercel publiserer.
  - `app.js`: øverst ligger tripdata som er lett å endre: løpsstart, teamet (`CREW`), flyreiser (`FLIGHTS`), overnatting (`STAYS`), leiebil (`CAR`), pakkeliste og teamradio-sitater.
  - `assets/intro.mp4` og `assets/intro-mobile.mp4`: introfilmen (liggende og stående), laget med Remotion i `video/`. `assets/f1-theme.m4a` er musikken den er synket til.
- `brag-output/`: introvideoen i full oppløsning (`brag.mp4`), plakatbilde, plan og delingstekst, laget med `/brag-slim`. Skriptene som lager videoen ligger i `brag-output/work/`.
- `video/`: Remotion-prosjektet for introfilmen: åpningen (startlys, ruten, banen), bilen som overgang og teamintroen med alle fire førerne, synket til F1-temaet. Tidslinjen ligger i `video/src/timeline.ts`. Se `video/README.md` for forhåndsvisning og rendering.

## Lokalt

```sh
cd site && python3 -m http.server 8000
```

## Publisering

Vercel-prosjektet har `site/` som rotmappe. Push til `main` publiserer automatisk.

## Planleggingstavla (Firebase)

Overnatting og leiebil kan planlegges rett på siden: legg til forslag, stem, merk som booket og huk av punkter.

- Data ligger i Firestore i Firebase-prosjektet `rbr27-70136e6c`. Koden er `site/plan.js`, og Firebase-biblioteket er bundlet i `site/assets/vendor/firebase.js`.
- Alle kan se planen. For å skrive må man velge navn og oppgi lagkoden. Koden ligger i `config/team` i databasen og kan ikke leses fra nettsiden.
- Sikkerhetsreglene ligger i `firebase/firestore.rules`. Publiser endringer med `firebase deploy --only firestore:rules`.
