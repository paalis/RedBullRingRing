import { staticFile } from "remotion";

// Samme team som CREW i site/app.js (navn, roller, lagfarger og bilder).
export type Driver = {
  name: string;
  fullName: string;
  code: string;
  number: number;
  home: string;
  role: string;
  team: string;
  photo: string;
  close: string;
  wide: string;
};

const crew = (d: Omit<Driver, "photo" | "close" | "wide">, file: string): Driver => ({
  ...d,
  photo: staticFile(`crew/${file}.webp`),
  close: staticFile(`crew/${file}-close.webp`),
  wide: staticFile(`crew/${file}-wide.webp`),
});

export const CREW: Driver[] = [
  crew({ name: "Filip", fullName: "Filip Johannes Grydeland", code: "GRY", number: 7, home: "Trondheim", role: "Teamsjef", team: "#e10600" }, "filip"),
  crew({ name: "Pål André", fullName: "Pål André Weisethaunet", code: "WEI", number: 16, home: "Trondheim", role: "Strateg", team: "#ff8000" }, "pal-andre"),
  crew({ name: "Hans-Kristian", fullName: "Hans-Kristian Holthe", code: "HOL", number: 44, home: "Oslo", role: "Navigatør", team: "#27f4d2" }, "hans-kristian"),
  crew({ name: "Håvard", fullName: "Håvard Åstum Wahl", code: "WAH", number: 81, home: "Kristiansand", role: "Schnitzel-sjef", team: "#b64dff" }, "havard"),
];

// Rekkefølge i line-upen fra venstre: ytterst bak, innerst foran (som F1-plakaten).
export const LINEUP = [2, 0, 1, 3];

export const splitName = (d: Driver) => {
  const words = d.fullName.split(" ");
  const last = words.length > 1 ? words.pop()! : d.fullName;
  return { first: words.length ? words.join(" ") : d.name, last };
};
