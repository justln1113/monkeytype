import { Config } from "../config/store";
import Format from "../singletons/format";
import { Formatting } from "../utils/format";
import {
  get as getTypingSpeedUnit,
  type TypingSpeedUnitSettings,
} from "../utils/typing-speed-units";
import { isBopomofoActive } from "./mode";

/** Bopomofo speed is hanzi per minute, never converted to another unit. */
export const HANZI_SPEED_UNIT = "字/分";

const hanziFormat = new Formatting({
  typingSpeedUnit: "wpm",
  get alwaysShowDecimalPlaces() {
    return Config.alwaysShowDecimalPlaces;
  },
});

export function getSpeedFormat(): Formatting {
  return isBopomofoActive() ? hanziFormat : Format;
}

export function getSpeedUnitLabel(): string {
  return isBopomofoActive() ? HANZI_SPEED_UNIT : Config.typingSpeedUnit;
}

export function getSpeedUnitSettings(): TypingSpeedUnitSettings {
  if (!isBopomofoActive()) return getTypingSpeedUnit(Config.typingSpeedUnit);
  const wpm = getTypingSpeedUnit("wpm");
  return {
    fromWpm: (value) => wpm.fromWpm(value),
    toWpm: (value) => wpm.toWpm(value),
    fullUnitString: "Hanzi per Minute",
    histogramDataBucketSize: wpm.histogramDataBucketSize,
    historyStepSize: wpm.historyStepSize,
  };
}
