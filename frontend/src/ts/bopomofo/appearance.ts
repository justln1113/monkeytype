import { Config } from "../config/store";
import { configEvent } from "../events/config";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400&family=Noto+Serif+TC:wght@400&display=swap";
let fontsRequested = false;

/** CJK fonts are large; only fetch them once bopomofo mode is used. */
function requestFonts(): void {
  if (fontsRequested) return;
  fontsRequested = true;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = FONTS_URL;
  document.head.appendChild(link);
}

function applyFont(): void {
  const serif = Config.bopomofoFont === "serif";
  for (const id of ["words", "resultWordsHistory"]) {
    document.getElementById(id)?.classList.toggle("bopomofoSerif", serif);
  }
}

export function applyBopomofoAppearance(active: boolean): void {
  if (active) requestFonts();
  const words = document.getElementById("words");
  words?.classList.toggle(
    "bopomofoInstant",
    active && Config.smoothCaret === "off",
  );
  applyFont();
}

configEvent.subscribe(({ key }) => {
  if (key === "bopomofoFont") applyFont();
  if (key === "smoothCaret") {
    document
      .getElementById("words")
      ?.classList.toggle("bopomofoInstant", Config.smoothCaret === "off");
  }
});
