// Tar stillbilder av introen ved gitte tidspunkter (sekunder), for å kontrollere scener og overganger.
// Bruk: node scripts/stills.mjs <komposisjon> <utmappe> <sek> [sek …]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [id, out, ...secs] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("../site/assets") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  await renderStill({ serveUrl, composition, frame, output: path.join(out, `${id}-${s}.png`), browserExecutable, scale: id.includes("Mobile") ? 1 : 0.5 });
  console.log("still", s);
}
