import {
  decodeUnit,
  encodeUnit,
  parseAnnotatedText,
  type HanziUnit,
} from "./parse";

const SEP = "\u0001";

export function isEncodedUnit(word: string): boolean {
  return word.includes(SEP);
}

export function hanziCount(token: string): number {
  const bar = token.indexOf("|");
  return bar < 0 ? 0 : [...token.slice(0, bar)].length;
}

/** One word-list token → encoded units, one per typed unit. Idempotent. */
export function expandToken(token: string, typePunctuation: boolean): string[] {
  if (isEncodedUnit(token)) return [token];
  return parseAnnotatedText(token, { typePunctuation }).map(encodeUnit);
}

/** A whole quote (space separated tokens) → encoded units. */
export function expandQuoteText(
  text: string,
  typePunctuation: boolean,
): string[] {
  return parseAnnotatedText(text, { typePunctuation }).map(encodeUnit);
}

export function isHanziUnit(word: string): boolean {
  return decodeUnit(word)?.kind === "hanzi";
}

/**
 * Picks a token that fits in the remaining hanzi budget so a word is never
 * cut off at the end of a words-mode test.
 */
export function pickFittingToken(
  pick: () => string,
  remaining: number,
): string {
  let token = pick();
  for (let i = 0; i < 100 && hanziCount(token) > remaining; i++) {
    token = pick();
  }
  if (hanziCount(token) <= remaining) return token;
  // nothing short enough came up: fall back to the first hanzi of the word
  const first = parseAnnotatedText(token)[0] as HanziUnit;
  return `${first.hanzi}|${first.reading}`;
}

const RANDOM_PUNCTUATION: [string, number][] = [
  ["，", 0.6],
  ["。", 0.2],
  ["、", 0.1],
  ["？", 0.05],
  ["！", 0.05],
];

/** Random punctuation unit to follow a word when punctuation is on. */
export function maybePunctuationUnit(random: () => number): string | null {
  if (random() >= 0.2) return null;
  let roll = random();
  let char = "，";
  for (const [candidate, weight] of RANDOM_PUNCTUATION) {
    roll -= weight;
    if (roll < 0) {
      char = candidate;
      break;
    }
  }
  return encodeUnit({ kind: "punct", char, groupEnd: true });
}
