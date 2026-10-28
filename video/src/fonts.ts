import { loadFont } from "@remotion/fonts";
import { cancelRender, staticFile } from "remotion";

// Remotion delays captures until each actual local font has loaded.
for (const [family, file, weight] of [
  ["Titillium", "titillium-900.woff2", "900"],
  ["Titillium", "titillium-700.woff2", "700"],
  ["Titillium", "titillium-600.woff2", "600"],
  ["Unbounded", "unbounded-800.woff2", "800"],
  ["Mr Dafoe", "mr-dafoe-400.woff2", "400"],
]) {
  loadFont({ family, url: staticFile(`fonts/${file}`), weight }).catch(
    cancelRender,
  );
}
