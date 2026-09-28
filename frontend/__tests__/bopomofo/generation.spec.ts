import { describe, it, expect } from "vitest";
import { expandQuoteText } from "../../src/ts/bopomofo/generation";
import { decodeUnit } from "../../src/ts/bopomofo/parse";

describe("expandQuoteText", () => {
  it("runs sentences together without word gaps", () => {
    const units = expandQuoteText("今天|ㄐㄧㄣˉㄊㄧㄢˉ 好|ㄏㄠˇ 。", false).map(
      decodeUnit,
    );
    expect(units.map((u) => u?.groupEnd)).toEqual([false, false, false]);
  });
});
