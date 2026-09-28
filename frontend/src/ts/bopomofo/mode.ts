import { Config } from "../config/store";

export function isBopomofoLanguage(language: string): boolean {
  return language === "bopomofo" || language.startsWith("bopomofo_");
}

export function isBopomofoActive(): boolean {
  return isBopomofoLanguage(Config.language);
}

/**
 * Quotes normally force punctuation off; bopomofo quotes keep the toggle so
 * their full-width marks can be typed or skipped.
 */
export function quoteKeepsPunctuationToggle(language: string): boolean {
  return isBopomofoLanguage(language);
}
