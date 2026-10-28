// Nettsidens lokale fonter (site/assets/fonts). loadFont venter med renderingen til de er lastet.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const titillium = ["400", "600", "700", "900"].map((weight) =>
  loadFont({ family: "Titillium", url: staticFile(`fonts/titillium-${weight}.woff2`), weight }),
);

export const fontsLoaded = Promise.all([
  ...titillium,
  loadFont({ family: "Titillium", url: staticFile("fonts/titillium-700-italic.woff2"), weight: "700", style: "italic" }),
  // Nær F1-grafikken: Montserrat Black til etternavn, Allura som signatur til fornavn,
  // Michroma til lag/by-etiketter og Orbitron til startnumre.
  loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-900.woff2"), weight: "900" }),
  loadFont({ family: "Allura", url: staticFile("fonts/allura-400.woff2"), weight: "400" }),
  loadFont({ family: "Michroma", url: staticFile("fonts/michroma-400.woff2"), weight: "400" }),
  loadFont({ family: "Orbitron", url: staticFile("fonts/orbitron-800.woff2"), weight: "800" }),
]);
