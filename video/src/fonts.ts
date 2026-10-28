// Nettsidens lokale fonter (site/assets/fonts). loadFont venter med renderingen til de er lastet.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const titillium = ["400", "600", "700", "900"].map((weight) =>
  loadFont({ family: "Titillium", url: staticFile(`fonts/titillium-${weight}.woff2`), weight }),
);

export const fontsLoaded = Promise.all([
  ...titillium,
  loadFont({ family: "Titillium", url: staticFile("fonts/titillium-700-italic.woff2"), weight: "700", style: "italic" }),
  loadFont({ family: "Mr Dafoe", url: staticFile("fonts/mr-dafoe-400.woff2"), weight: "400" }),
  loadFont({ family: "Unbounded", url: staticFile("fonts/unbounded-800.woff2"), weight: "800" }),
]);
