import { Config } from "../config/store";
import { configEvent } from "../events/config";
import { qs } from "../utils/dom";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400&family=Noto+Serif+TC:wght@400;600&display=swap";
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

let bopomofoActive = false;

function applyClasses(): void {
  const serif = Config.bopomofoFont === "serif";
  qs("#words")?.toggleClass("bopomofoSerif", serif);
  qs("#resultWordsHistory")?.toggleClass("bopomofoSerif", serif);
  qs("#words")?.toggleClass(
    "bopomofoInstant",
    bopomofoActive && Config.smoothCaret === "off",
  );
}

export function applyBopomofoAppearance(active: boolean): void {
  bopomofoActive = active;
  if (active) requestFonts();
  applyClasses();
}

configEvent.subscribe(({ key }) => {
  if (key === "bopomofoFont" || key === "smoothCaret") applyClasses();
});
