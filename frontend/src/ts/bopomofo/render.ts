import { isToneMark, type BopomofoUnit } from "./parse";
import { TONE1 } from "./keymap";

/** Symbol slots in the bopomofo column; more typed symbols are blocked. */
export const MAX_SYMBOLS = 4;

type RenderOptions = {
  /** show what was typed instead of the target for wrong symbols */
  showTypedTypos: boolean;
};

const escape = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Inner HTML of a `.word.bopomofo` element: the hanzi with its vertical
 * bopomofo column. Letter order is typing order (symbols, then tone) so the
 * n-th `letter` is where the caret goes after n keystrokes.
 *
 * The column is a grid of 10 half-rows: 2 for the neutral-tone dot, then 4
 * symbol slots. Symbols are centred in the slots; ˊˇˋ sit beside the last
 * symbol, ˙ above the first. Positions are grid areas (no `position`), so
 * offsetTop/Left stay relative to the word for the caret.
 */
export function renderBopomofoWord(
  unit: BopomofoUnit,
  input: string,
  options: RenderOptions,
): string {
  if (unit.kind === "punct") {
    const committed = input.length > 0;
    const wrong = committed && input !== unit.char;
    const shown = wrong && options.showTypedTypos ? input : unit.char;
    const cls = committed ? (wrong ? "incorrect" : "correct") : "";
    return `<letter class="pglyph ${cls}">${escape(shown)}</letter>`;
  }

  const targetSymbols = [...unit.reading.slice(0, -1)];
  const targetTone = unit.reading.slice(-1);
  const typed = [...input];
  const typedTone =
    typed.length > 0 && isToneMark(typed[typed.length - 1] as string)
      ? typed.pop()
      : undefined;
  const committed = typedTone !== undefined;

  const slots = Math.min(
    MAX_SYMBOLS,
    Math.max(targetSymbols.length, typed.length, 1),
  );
  const firstRow = 3 + (MAX_SYMBOLS - slots);
  const lastRow = firstRow + 2 * (slots - 1);

  let letters = "";
  for (let i = 0; i < slots; i++) {
    const target = targetSymbols[i];
    const char = typed[i];
    let cls = "";
    let shown = target ?? char ?? "";
    if (char === undefined) {
      // untyped (or missed, if committed)
    } else if (target === undefined) {
      cls = "incorrect extra";
      shown = char;
    } else if (char === target) {
      cls = "correct";
    } else {
      cls = "incorrect";
      if (options.showTypedTypos) shown = char;
    }
    letters += `<letter class="${cls}" style="grid-area:${firstRow + 2 * i} / 1 / span 2 / 2">${escape(shown)}</letter>`;
  }

  let toneShown = targetTone;
  let toneCls = "tone";
  if (committed) {
    if (typedTone === targetTone) {
      toneCls += " correct";
    } else {
      toneCls += " incorrect";
      toneShown = typedTone;
    }
  }
  if (toneShown === TONE1 && !toneCls.includes("incorrect")) {
    toneCls += " toneHidden";
  }
  let area;
  if (toneShown === "˙") {
    toneCls += " dot";
    area = `${firstRow - 2} / 1 / span 2 / 2`;
  } else {
    if (targetSymbols.length === 3 && slots === 3) toneCls += " three";
    area = `${lastRow - 1} / 2 / span 2 / 3`;
  }
  letters += `<letter class="${toneCls}" style="grid-area:${area}">${toneShown}</letter>`;

  const before = unit.punctBefore
    ? `<span class="punct">${escape(unit.punctBefore)}</span>`
    : "";
  const after = unit.punctAfter
    ? `<span class="punct">${escape(unit.punctAfter)}</span>`
    : "";
  return `${before}<span class="hanzi">${escape(unit.hanzi)}</span><span class="bpmf">${letters}</span>${after}`;
}

/** Classes for the `.word` element itself. */
export function bopomofoWordClasses(unit: BopomofoUnit): string {
  return `bopomofo${unit.kind === "punct" ? " punctUnit" : ""}${unit.groupEnd ? " groupEnd" : ""}`;
}
