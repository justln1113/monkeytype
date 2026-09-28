import { isFunboxActiveWithProperty } from "../../test/funbox/list";
import { areCharactersVisuallyEqual, isSpace } from "../../utils/strings";
import { Config } from "../../config/store";
import { isBopomofoActive } from "../../bopomofo/mode";
import { isPunctTarget, isToneMark } from "../../bopomofo/parse";

/**
 * What kind of commit a character triggers, or false if it does not commit.
 * - "separator": a space or newline that ends the current word
 * - "nospace": the final letter of a word in a nospace funbox
 * - "tone": a bopomofo tone mark ending a syllable, or a punctuation unit's key
 */
export type CommitCharacterType = "separator" | "nospace" | "tone";

export function getCommitCharacterType(options: {
  data: string;
  inputValue: string;
  targetWord: string;
}): CommitCharacterType | false {
  const { data, inputValue, targetWord } = options;

  if (isSpace(data)) {
    return "separator";
  }

  if (data === "\n") {
    return "separator";
  }

  if (isBopomofoActive()) {
    if (isToneMark(data)) return "tone";
    // punctuation units have no tone: their single key commits them
    if (
      isPunctTarget(targetWord) &&
      (inputValue + data).length >= targetWord.length
    ) {
      return "tone";
    }
    return false;
  }

  const nospace = isFunboxActiveWithProperty("nospace");

  if (nospace && (inputValue + data).length === targetWord.length) {
    return "nospace";
  }

  return false;
}

/** Bopomofo shares the nospace funbox's separator-free paths. */
export function isNoSeparatorMode(): boolean {
  return isFunboxActiveWithProperty("nospace") || isBopomofoActive();
}

/**
 * Normalize data to the target char when they are visually equivalent
 * (e.g. IME U+3000 space → U+0020), so commit/correctness checks are consistent.
 * Pure — no input-element side effects.
 */
export function normalizeData(
  data: string,
  inputValue: string,
  targetWord: string,
): string {
  const targetChar = targetWord[inputValue.length];
  if (
    targetChar !== undefined &&
    areCharactersVisuallyEqual(data, targetChar, Config.language)
  ) {
    return targetChar;
  }
  if (isSpace(data)) {
    return " ";
  }
  return data;
}
