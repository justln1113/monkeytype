import { describe, it, expect } from "vitest";
import {
  parseAnnotatedText,
  validateAnnotatedToken,
} from "../../src/ts/bopomofo/parse";

describe("validateAnnotatedToken", () => {
  it.each(["我們|ㄨㄛˇㄇㄣ˙", "天|ㄊㄧㄢˉ", "是|ㄕˋ", "，", "。」"])(
    "accepts %s",
    (token) => {
      expect(validateAnnotatedToken(token)).toBeNull();
    },
  );

  it.each([
    ["我們|ㄨㄛˇ", "2 hanzi but 1 readings"],
    ["我|ㄨㄛ", "reading without tone"],
    ["我|woˇ", "not bopomofo"],
    ["我|ㄨㄛㄢㄣˇ", "too many symbols"],
    ["|ㄨㄛˇ", "no hanzi"],
  ])("rejects %s", (token, reason) => {
    expect(validateAnnotatedToken(token)).toContain(reason);
  });
});

describe("parseAnnotatedText", () => {
  it("splits a word token into one unit per hanzi with its reading", () => {
    expect(parseAnnotatedText("我們|ㄨㄛˇㄇㄣ˙")).toEqual([
      {
        kind: "hanzi",
        hanzi: "我",
        reading: "ㄨㄛˇ",
        punctBefore: "",
        punctAfter: "",
        groupEnd: false,
      },
      {
        kind: "hanzi",
        hanzi: "們",
        reading: "ㄇㄣ˙",
        punctBefore: "",
        punctAfter: "",
        groupEnd: true,
      },
    ]);
  });

  it("attaches display-only punctuation to the neighbouring hanzi", () => {
    const units = parseAnnotatedText("「 好|ㄏㄠˇ ， 走|ㄗㄡˇ 。 」");
    const summary = units.map((u) =>
      u.kind === "hanzi" ? [u.hanzi, u.punctBefore, u.punctAfter] : [u.char],
    );
    expect(summary).toEqual([
      ["好", "「", "，"],
      ["走", "", "。」"],
    ]);
  });

  it("turns each punctuation mark into its own unit when punctuation is typed", () => {
    const units = parseAnnotatedText("好|ㄏㄠˇ ，」 走|ㄗㄡˇ", {
      typePunctuation: true,
    });
    expect(units).toEqual([
      {
        kind: "hanzi",
        hanzi: "好",
        reading: "ㄏㄠˇ",
        punctBefore: "",
        punctAfter: "",
        groupEnd: true,
      },
      { kind: "punct", char: "，", groupEnd: false },
      { kind: "punct", char: "」", groupEnd: true },
      {
        kind: "hanzi",
        hanzi: "走",
        reading: "ㄗㄡˇ",
        punctBefore: "",
        punctAfter: "",
        groupEnd: true,
      },
    ]);
  });
});
