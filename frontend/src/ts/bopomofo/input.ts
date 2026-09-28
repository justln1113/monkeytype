import { isSpace } from "../utils/strings";
import type { KeyLike, KeyResult } from "./keymap";
import { isPunctTarget, isToneMark, SYMBOL_SLOTS } from "./parse";

/**
 * Input the bopomofo mode refuses outright, before it counts as a keystroke:
 * real spaces (tone 1 is typed as ˉ), a tone with no symbol before it,
 * symbols past the column's last slot, and anything after a tone that did not
 * commit (stop on error keeps a wrong tone until it is deleted).
 */
export function isBopomofoInputBlocked(options: {
  data: string;
  inputValue: string;
  targetWord: string;
}): boolean {
  const { data, inputValue, targetWord } = options;
  if (isSpace(data)) return true;
  if (isPunctTarget(targetWord)) return false;
  if ([...inputValue].some(isToneMark)) return true;
  if (isToneMark(data)) return inputValue === "";
  return [...inputValue].length >= SYMBOL_SLOTS;
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
