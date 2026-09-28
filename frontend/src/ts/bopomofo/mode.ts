import { Config } from "../config/store";

export function isBopomofoLanguage(language: string): boolean {
  return language === "bopomofo" || language.startsWith("bopomofo_");
}

/** Bopomofo mode is on whenever a bopomofo language is selected. */
export function isBopomofoActive(): boolean {
  return isBopomofoLanguage(Config.language);
}
