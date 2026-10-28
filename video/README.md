# Red Bull Ring · Remotion-intro

En redigerbar film for turen med Filip, Pål André, Hans-Kristian og Håvard. Remotion lager den ferdige sekvensen med synkron lyd. Nettsiden spiller en vanlig MP4 og trenger ingen React- eller Remotion Player-avhengighet.

Komposisjonene bruker prosjektets eksisterende bilder, fonter, banekontur, farger og personopplysninger. De vedlagte F1-utklippene er referanser for utsnitt, typografi og klipping; de profesjonelle førerne erstatter ikke turdeltakerne. Se [INTRO_PLAN.md](INTRO_PLAN.md) for sceneplan og føringer fra `brag-slim` og Remotion-skillene.

## Installer og forhåndsvis

Kjør fra repoets rot:

```sh
cd video
npm ci
npm run dev
```

Node.js 24 anbefales. Remotion-pakkene har samme eksakte versjon, og `package-lock.json` låser installasjonen. Åpne adressen Studio skriver ut. Velg `RedBullRingIntro` eller `RedBullRingIntroMobile`.

Begge varer **52,10 sekunder: 1563 rammer ved 30 fps**. Desktop er **1920 × 1080**. Mobil er **720 × 1280**, med egen komposisjon i en logisk flate på 1080 × 1920; den er ikke et sentrumsutsnitt av desktopfilen.

`predev`, `prebuild`, `prerender` og `prestill` klargjør lokale mediefiler automatisk. Klargjøringen bruker FFmpeg og FFprobe på PATH, eller Remotions installerte CLI som reserve. Ingen nye bilder eller lyd lastes fra nettet.

## Generer nettsidens intro på nytt

Fra `video/`:

```sh
npm run render:intro
```

Denne kommandoen klargjør kildematerialet og rendrer begge filmer og begge plakatbilder direkte til nettstedets eksisterende mediemappe:

| Fil i `site/assets/` | Format | Koding |
|---|---|---|
| `intro-desktop.mp4` | 1920 × 1080, 30 fps, 52,10 s | H.264, yuv420p, CRF 22, AAC 160 kbit/s |
| `intro-mobile.mp4` | 720 × 1280, 30 fps, 52,10 s | H.264, yuv420p, CRF 23, AAC 160 kbit/s |
| `intro-poster-desktop.jpg` | 1920 × 1080 | JPEG 90, ramme 1470 / 49 s |
| `intro-poster-mobile.jpg` | 720 × 1280 | JPEG 90, ramme 1470 / 49 s |

Remotion 4.0.539 legger MP4-metadata foran videodataene med Fast Start. Posterbilder er separate filer. Filmens første ramme er den faktiske åpningen; ingen enkeltstående slutttittel er satt inn foran tidslinjen.

Alle valgte utdata rendres i en midlertidig mappe først. Nettsidens filnavn erstattes atomisk etter at samtlige valgte renderinger har lyktes. En renderfeil beholder de tidligere filene. Skriptet feiler med en tydelig feilmelding og en ikke-null avslutningskode. Kommandoen publiserer ikke siden.

For å rendre bare én variant eller bare posterne:

```sh
npm run render:intro -- --desktop
npm run render:intro -- --mobile
npm run render:intro -- --posters-only
npm run render:intro -- --mobile --posters-only
```

Standard parallellitet er to nettleserfaner. Bruk en annen verdi eller en allerede installert Chrome/Chromium slik:

```sh
BROWSER_EXECUTABLE=/sti/til/chrome RENDER_CONCURRENCY=2 npm run render:intro
```

Utelat `BROWSER_EXECUTABLE` for Remotions standardnettleser. Første rendering kan da kreve at Remotion laster ned nettleseren. For Windows kan de samme miljøvariablene settes med PowerShell før kommandoen kjøres.

De tidligere kommandoene fungerer fortsatt og skriver kun til `video/out/`:

```sh
npm run render
npm run still
```

`render` lager `out/red-bull-ring-intro.mp4`. `still` lager `out/poster.png` fra ramme 90, som før. For en annen ramme eller lokal nettleser kan vanlige Remotion-flagg sendes videre, for eksempel:

```sh
npm run still -- --frame=1470 --browser-executable=/sti/til/chrome
npm run render -- --browser-executable=/sti/til/chrome --concurrency=2
```

## Rediger innhold, utsnitt og timing

| Fil | Ansvar |
|---|---|
| `../site/app.js`, `CREW` | Verifiserte navn, roller, hjembyer, nummer, farger og bildestier. |
| `../site/assets/crew/` | Eksisterende portretter, nærbilder og brede utsnitt. |
| `src/config.ts` | Musikalske markører, farger og individuelle desktop-/mobilutsnitt. |
| `src/Composition.tsx` | Scener, bildebevegelser, tekst, overganger og lydvolum. |
| `src/Root.tsx` | De to komposisjonenes ID, størrelse, bildefrekvens og varighet. |
| `src/fonts.ts` | De lokale fontene fra nettstedet. |
| `scripts/prepare-assets.mjs` | Kopiering og normalisering av kildemateriale. |
| `scripts/render-intro.mjs` | Komprimering, poster-ramme, utdata og sikker erstatning av ferdige filer. |
| `INTRO_PLAN.md` | Sceneoversikt med sekunder, rammer og motivvalg. |

`public/project.json` genereres fra nettstedets `CREW` og nøyaktige SVG-banekontur. Endre kilden, ikke den genererte kopien. Kjør `npm run assets` for å klargjøre materialet uten å starte Studio eller rendering.

## Lyd og én felles tidslinje

Originalen beholdes i `public/audio/f1theme-source.m4a`. AAC-filen har 52,152018 s containervarighet og startstempel 0,063855 s. Klargjøringen dekoder den til float PCM med `asetpts=PTS-STARTPTS`: `public/audio/f1theme.wav`, stereo 44 100 Hz, **52,088163 s**.

Alle scenetider gjelder første dekodede sample i denne WAV-filen. Ikke trekk fra startstempelet på nytt i komposisjonen. Grensene beregnes med `Math.round(seconds * fps)`, og varighetene tas som differansen mellom to grenser. Slik driver ikke klippene fra musikken ved gjentatt avrunding. Gain og uttoning skjer på Remotion-tidslinjen, ikke i klargjøringsskriptet.

Analysen av bølgeform, frekvensenergi og anslag gir en foreløpig puls på omtrent 100 BPM og et tydelig innslag ved 15,375 s. **Musikken er ikke kontrollert ved lytting i kjøremiljøet.** At dette innslaget svarer nøyaktig til ønsket start på trommer og horn, samt avslutningens musikalske følelse, må bekreftes ved faktisk avspilling. Målegrunnlaget er dokumentert i `public/audio/audio-analysis.json`.

For å legge inn et annet lydspor:

```sh
node scripts/prepare-assets.mjs /sti/til/ny-lydfil.m4a
```

Skriptet beholder denne filen som ny kilde og markerer at de tidligere musikalske markørene må analyseres på nytt. Juster deretter `src/config.ts` og varighetene i `src/Root.tsx` før rendering. Poster-ramme 1470 forutsetter den nåværende lengden og må også justeres for en kortere film.

Den normaliserte WAV-filen, bundler, renderarbeid og nettleserinstallasjon trenger ikke lagres i Git. Den beholdte M4A-kilden og skriptene gjør lydfilen reproduserbar. Nettsiden laster bare én ferdig video etter en brukerhandling; den laster verken WAV-kilden, Studio eller Remotions kjøremiljø.

## Kontroller

```sh
npm run lint
npm run build
```

`lint` kjører ESLint og TypeScript. `build` lager en Remotion-bundle; MP4 genereres med `render:intro`. Etter eksport åpnes nettstedet lokalt:

```sh
cd ../site
python3 -m http.server 8000
```

Kontroller åpning, hvert sceneskifte, lange navn, ansiktsutsnitt og slutttittel på begge formater. Test også start med lyd, pause, lyd av/på, hopp over, gjentatt avspilling, fokus etter lukking, senere besøk, redusert bevegelse og avvist avspilling/mediefeil. Ved slutten skal både film og lyd stoppe og turplanleggingen være tilgjengelig.

### Målt eksport og gjennomført kontroll

| Resultat | Målt verdi / kontrollstatus |
|---|---|
| Desktop MP4 | 4 309 007 byte / 4,31 MB; 1920 × 1080. |
| Mobil MP4 | 2 777 287 byte / 2,78 MB; 720 × 1280. |
| Posterfiler | Desktop 88 431 byte; mobil 53 073 byte. |
| Video i begge varianter | H.264 High / yuv420p, 30 fps, 1563 dekodede rammer, 52,100 s. |
| Lyd i begge varianter | AAC-LC stereo, 48 kHz, målt 157 376 bit/s; −15,05 LUFS integrert og −2,56 dBTP. |
| MP4 Fast Start | Verifisert i begge filer: `moov` ved byte 32, før `mdat`. |
| Full rendering og visuell kontroll | Begge filmer rendret. Åpning, scener, navn, ansikter, slutttittel og mobilutsnitt kontrollert; i tillegg 54 overgangsrammer per variant. Full dekoding uten feil eller utilsiktede svarte pauser. |
| Nettlesertest desktop/mobil | Begge ekte MP4-filer avspilt sekvensielt til naturlig slutt i Chromium ved 1440 × 900 og 390 × 844. Start med lyd, pause, lyd av/på, hopp over, replay, kildefrakobling og fokus tilbake bestått. Ingen JavaScript-feil. |
| Lasting og fallback | Ingen videonedlasting før start; bare riktig variant lastet. Redusert bevegelse, senere besøk, dypkobling, Tab/Escape, nektet lagring, avvist avspilling, mediefeil, treg lasting og navigasjon under avspilling kontrollert. Feiltilfellene ble simulert i nettleseren. |
| Bygge- og kodekontroller | `npm run lint`, `npm run build`, JavaScript-syntakskontroll og `git diff --check` bestått. |
| Musikalsk lytting | Ikke tilgjengelig i kjøremiljøet; manuell kontroll gjenstår. |

AAC-innpakningen gir 52,117 s containervarighet, 17 ms mer enn videosporet. Denne ekstra halen er stille. Sammenligning av kilde og ferdig lyd ved 14,5–16,5 s, 25–27 s og 44–46 s fant 0 samples utilsiktet forskyvning ved 48 kHz. Førerpresentasjonen starter på ramme 461 / 15,366667 s, innenfor én videoramme av det analyserte anslaget ved 15,375057 s. Lydnivået tones gradvis ned og er praktisk talt stille ved 52,08 s.

Kontrollen ble utført i headless Chromium, med korte pauser for stillbilder. Desktop rapporterte 57 droppede visningsrammer av 1514 ved siste kontrollpunkt, mobil 0 av 1482. Begge ferdige filer inneholder alle 1563 rammer og dekodes uten feil. Dette er ikke en ytelsesmåling fra en fysisk telefon. Safari/iOS, produksjonens innlogging og selve Vercel-publiseringen er ikke verifisert. Lyddekoding og umutet avspilling er teknisk kontrollert, men erstatter ikke faktisk lytting.

Den tidligere nettsideintroen var en kombinasjon av en 12 s MP4 (619 741 byte), separat lydfil (913 284 byte) og CSS-scener. Med posterbildet var de faste introfilene 1 578 644 byte / 1,58 MB, i tillegg til portrettene som CSS-sekvensen brukte. Hele det visuelle forløpet var omtrent 53 s. Den nye filmen er større, men inneholder hele forløpet, høyere desktopoppløsning og ferdig synkroniserte scener. Besøkende henter bare valgt videovariant, og først etter at de starter avspilling. Før dette lastes kun det responsive posterbildet.
