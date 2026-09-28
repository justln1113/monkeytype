/**
 * Annotated bopomofo text.
 *
 * A token is either `漢字|讀音` (one reading per hanzi, each reading ends with
 * its tone mark; tone 1 is written as "ˉ") or a bare punctuation token.
 * Word lists hold one token per entry; quotes are space separated tokens.
 */

export const TONE_MARKS = ["ˉ", "ˊ", "ˇ", "ˋ", "˙"] as const;
const toneSet = new Set<string>(TONE_MARKS);

export type HanziUnit = {
  kind: "hanzi";
  hanzi: string;
  reading: string;
  punctBefore: string;
  punctAfter: string;
  /** last hanzi of its word token */
  groupEnd: boolean;
};

export type PunctUnit = {
  kind: "punct";
  char: string;
  groupEnd: boolean;
};

export type BopomofoUnit = HanziUnit | PunctUnit;

export function isToneMark(char: string): boolean {
  return toneSet.has(char);
}

/** "ㄨㄛˇㄇㄣ˙" → ["ㄨㄛˇ", "ㄇㄣ˙"] */
export function splitReadings(readings: string): string[] {
  const out: string[] = [];
  let current = "";
  for (const char of readings) {
    current += char;
    if (isToneMark(char)) {
      out.push(current);
      current = "";
    }
  }
  return out;
}

const BOPOMOFO_SYMBOL = /^[ㄅ-ㄩ]$/;
const MAX_SYMBOLS_PER_READING = 3;

/** Returns a problem description, or null when the token is well formed. */
export function validateAnnotatedToken(token: string): string | null {
  const bar = token.indexOf("|");
  if (bar < 0) {
    return [...token].some((c) => BOPOMOFO_SYMBOL.test(c) || isToneMark(c))
      ? "punctuation token contains bopomofo"
      : null;
  }
  const hanzi = [...token.slice(0, bar)];
  const readingText = token.slice(bar + 1);
  if (hanzi.length === 0) return "no hanzi";
  const readings = splitReadings(readingText);
  if (readings.join("") !== readingText) return "reading without tone";
  if (hanzi.length !== readings.length) {
    return `${hanzi.length} hanzi but ${readings.length} readings`;
  }
  for (const reading of readings) {
    const symbols = [...reading].slice(0, -1);
    if (!symbols.every((c) => BOPOMOFO_SYMBOL.test(c))) return "not bopomofo";
    if (symbols.length === 0) return "empty reading";
    if (symbols.length > MAX_SYMBOLS_PER_READING) return "too many symbols";
  }
  return null;
}

export function parseAnnotatedText(
  text: string,
  options: { typePunctuation?: boolean } = {},
): BopomofoUnit[] {
  const units: BopomofoUnit[] = [];
  let pendingBefore = "";
  for (const token of text.trim().split(/\s+/)) {
    const bar = token.indexOf("|");
    if (bar < 0 && options.typePunctuation === true) {
      const marks = [...token];
      marks.forEach((char, i) => {
        units.push({ kind: "punct", char, groupEnd: i === marks.length - 1 });
      });
      continue;
    }
    if (bar < 0) {
      // display-only punctuation: trails the previous hanzi, or leads the next one
      const last = units[units.length - 1];
      if (last?.kind === "hanzi") last.punctAfter += token;
      else pendingBefore += token;
      continue;
    }
    const hanzi = [...token.slice(0, bar)];
    const readings = splitReadings(token.slice(bar + 1));
    hanzi.forEach((h, i) => {
      units.push({
        kind: "hanzi",
        hanzi: h,
        reading: readings[i] as string,
        punctBefore: i === 0 ? pendingBefore : "",
        punctAfter: "",
        groupEnd: i === hanzi.length - 1,
      });
    });
    pendingBefore = "";
  }
  return units;
}

// The word pipeline (generator → Words) passes words around as space-free
// strings, so units are encoded with control-character separators.
const SEP = "\u0001";
const HANZI_TAG = "\u0002H";
const PUNCT_TAG = "\u0002P";

export function encodeUnit(unit: BopomofoUnit): string {
  if (unit.kind === "punct") {
    return [PUNCT_TAG, unit.char, unit.groupEnd ? "1" : "0"].join(SEP);
  }
  return [
    HANZI_TAG,
    unit.hanzi,
    unit.reading,
    unit.punctBefore,
    unit.punctAfter,
    unit.groupEnd ? "1" : "0",
  ].join(SEP);
}

export function decodeUnit(encoded: string): BopomofoUnit | null {
  const parts = encoded.split(SEP);
  if (parts[0] === PUNCT_TAG && parts.length === 3) {
    return {
      kind: "punct",
      char: parts[1] as string,
      groupEnd: parts[2] === "1",
    };
  }
  if (parts[0] === HANZI_TAG && parts.length === 6) {
    return {
      kind: "hanzi",
      hanzi: parts[1] as string,
      reading: parts[2] as string,
      punctBefore: parts[3] as string,
      punctAfter: parts[4] as string,
      groupEnd: parts[5] === "1",
    };
  }
  return null;
}

/** The characters the user types for a unit. */
export function unitTarget(unit: BopomofoUnit): string {
  return unit.kind === "hanzi" ? unit.reading : unit.char;
}
