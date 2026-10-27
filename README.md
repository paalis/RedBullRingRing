# RedBullRingRing

Nettsiden for turen vår til Østerrikes Grand Prix på Red Bull Ring, juli 2027. Fire kamerater fra Trondheim, Oslo og Kristiansand, via Wien og Graz til Spielberg.

## Struktur

- `site/`: selve nettsiden (statisk HTML/CSS/JS, uten byggesteg). Det er denne mappen Vercel publiserer.
  - `app.js`: øverst ligger tripdata som er lett å endre: løpsstart, teamet (`CREW`), flyreiser (`FLIGHTS`), overnatting (`STAYS`), pakkeliste og teamradio-sitater.
  - `assets/intro.mp4`: introsnutten som spilles i toppen av siden.
- `brag-output/`: introvideoen i full oppløsning (`brag.mp4`), plakatbilde, plan og delingstekst, laget med `/brag-slim`. Skriptene som lager videoen ligger i `brag-output/work/`.

## Lokalt

```sh
cd site && python3 -m http.server 8000
```

## Publisering

Vercel-prosjektet har `site/` som rotmappe. Push til `main` publiserer automatisk.
