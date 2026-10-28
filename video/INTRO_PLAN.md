# RBR '27 — introplan

## Retning og kilder

Fire kamerater på vei til Red Bull Ring. Behold nettstedets mørke bakgrunn,
rødfarge, Titillium, Unbounded og Mr Dafoe. Bruk de faktiske personene, navnene,
rollene og bildene fra `site/app.js`. F1-utklippene er referanser for utsnitt og
klipperytme. Ingen nye løpsdatoer legges til.

Tre gjennomgående grep: maskert typografi, korte retningsbestemte avdekkinger,
og kontrollert bevegelse mellom nærbilde og portrett. Hver person har egne
utsnitt og lagfarge. Wide-bildene er beskåret ved lår/knær; de møter
bildekanten eller en rolig uttoning, ikke en fotplattform.

Desktop: 1920 × 1080. Mobil: 720 × 1280, komponert separat i en logisk flate
på 1080 × 1920. Ingen automatisk beskjæring av desktopfilen.

## Skill-føringer

- `.claude/skills/brag-slim/SKILL.md`: virkelig prosjektidentitet, sterk
  åpning, lesbar tekst og kontroll av scener og overganger. Brukerens ønskede
  musikkforløp erstatter standardlengden. Poster leveres separat, uten et
  enkelt innbakt plakatbilde som blinker ved filmstart.
- `remotion-create` og `remotion-markup`: eksisterende prosjekt, Studio-
  forhåndsvisning, animasjon fra gjeldende ramme, lokale fonter og justerbare
  timing- og utsnittverdier i kildekoden.
- `remotion-render`: faktisk MP4-rendering og stillbilder, med kontroll av
  åpning, overgangsrammer, titler og avslutning.

## Musikk og tidsgrunnlag

Originalen `public/audio/f1theme-source.m4a` har 52,152018 s containervarighet
og 0,063855 s startstempel. Skriptet dekoder den til float PCM med start ved
sample 0: **52,088163 s**. Alle scenetider gjelder denne normaliserte starten.
Ingen ekstra trimming eller forskyvning legges til. Rammegrenser beregnes med
`Math.round(seconds * fps)`; varigheter er differanser mellom grensene.
**1563 rammer / 30 fps = 52,10 s.**

Anslagsanalysen viser omtrent 100 BPM og et tydelig innslag ved 15,375057 s
etter et energifall. Dette brukes som start for førerpresentasjonen.
**Musikken er ikke kontrollert ved lytting i miljøet.** At innslaget er
akkurat tromme-/horninnslaget må bekreftes ved avspilling. Andre grenser
nedenfor er målt fra den samme filens spektrale endringer.

Lydnivå reduseres 3 dB i komposisjonen. Siste anslag ved 50,824490 s leder
inn i uttoningen til siste sample. Ingen nye lydeffekter legges oppå.

## Scenekart

| Start–slutt (s) | Rammer [fra, til) | Bilde, tekst og klipp |
|---|---|---|
| 0–5,178 | 0–155 | Startlys og «4 kamerater. 3 byer. 1 løp.» Maskert tekst på åpningsanslagene. |
| 5,178–9,977 | 155–299 | Hjemstedene → Wien → Graz → Spielberg. Retningsbestemt bevegelse. |
| 9,977–15,375057 | 299–461 | Faktisk banekontur. «Ett mål.» Roligere hold før hovedinnslaget. |
| 15,375057–21,381406 | 461–641 | Filip: tett anslag, lys studioscene og GRYDELAND. |
| 21,381406–27,377778 | 641–821 | Pål André: nærbilde, mørk diagonal scene og WEISETHAUNET. |
| 27,377778–33,384127 | 821–1002 | Hans-Kristian: nærbilde, turkis innramming og HOLTHE. |
| 33,384127–39,979138 | 1002–1199 | Håvard: nærbilde, mørkt studio med lilla lys og WAHL. |
| 39,979138–44,788209 | 1199–1344 | Hele teamet; fire portretter og navn. |
| 44,788209–47,182766 | 1344–1415 | «Neste stopp: Spielberg». Nettstedets bil passerer én gang. |
| 47,182766–52,10 | 1415–1563 | «RED BULL RING / 2027». Rolig tittelhold. Ramme 1525 starter overgang til nettstedets bakgrunn. |

Førerportrettenes interne klipp ligger omtrent to slag etter scenestart.
Slutttittelen er fullt lesbar i over tre sekunder før uttoning.

## Nettsiden og kontroll

MP4 med synkron lyd, ingen Remotion Player i nettsiden. Vanlig HTML/JS styrer
dialog, brukerinitiert lyd, pause, hopp over, fokus og replay. Bare valgt
variant lastes, først etter brukerhandling. Statisk poster og direkte tilgang
til planen ved redusert bevegelse og medieproblemer.

Kontroller lange navn på mobil, ansiktsutsnitt, alle sceneskifter og lyd/video
i én tidslinje. Sammenlign ny lengde med hele gamle forløpet (~53 s), ikke
bare den gamle 12 s MP4-filen. Se README for renderkommandoer og kontrollstatus.
