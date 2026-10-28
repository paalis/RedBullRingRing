// Remotion-oppsett for introfilmen. Bilder, fonter og musikk hentes rett fra nettsidens assets-mappe,
// så det finnes bare én kopi av hvert bilde i repoet.
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
Config.setPublicDir("../site/assets");
