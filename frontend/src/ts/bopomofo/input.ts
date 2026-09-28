import { isSpace } from "../utils/strings";
import type { KeyLike, KeyResult } from "./keymap";
import { isToneMark } from "./parse";

/** A syllable has at most 3 symbols; one extra slot shows a typo. */
const MAX_TYPED_SYMBOLS = 4;

/**
 * Input the bopomofo mode refuses outright, before it counts as a keystroke:
 * real spaces (tone 1 is typed as ˉ), a tone with no symbol before it, and
 * symbols past the column's last slot.
 */
export function isBopomofoInputBlocked(options: {
  data: string;
  inputValue: string;
  targetWord: string;
}): boolean {
  const { data, inputValue, targetWord } = options;
  if (isSpace(data)) return true;
  const isPunctUnit = !isToneMark(targetWord.slice(-1));
  if (isPunctUnit) return false;
  if (isToneMark(data)) return inputValue === "";
  return [...inputValue].length >= MAX_TYPED_SYMBOLS;
}

export type BopomofoKeyAction =
  | { type: "insert"; data: string }
  // the OS IME is composing: nothing reaches the page as a physical key
  | { type: "ime" }
  // consumed without typing anything (backtick prefix)
  | { type: "swallow" };

type KeyEventLike = KeyLike & Pick<KeyboardEvent, "key" | "isComposing">;

/** What a keydown means in bopomofo mode; null leaves it to the regular handlers. */
export function bopomofoKeyAction(
  event: KeyEventLike,
  readKey: (event: KeyLike) => KeyResult | null,
): BopomofoKeyAction | null {
  if (event.key === "Process" || event.isComposing) return { type: "ime" };
  const result = readKey(event);
  if (result === null) return null;
  if (result.type === "pending") return { type: "swallow" };
  return { type: "insert", data: result.char };
}
