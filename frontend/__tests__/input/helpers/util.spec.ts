import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCommitCharacterType } from "../../../src/ts/input/helpers/util";
import * as FunboxList from "../../../src/ts/test/funbox/list";
import { __testing } from "../../../src/ts/config/testing";

vi.mock("../../../src/ts/test/funbox/list", () => ({
  isFunboxActiveWithProperty: vi.fn(),
}));

const isFunboxActiveWithProperty = vi.mocked(
  FunboxList.isFunboxActiveWithProperty,
);

describe("getCommitCharacterType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isFunboxActiveWithProperty.mockReturnValue(false);
    __testing.replaceConfig({ language: "english" });
  });

  it("returns 'separator' for a regular space", () => {
    expect(
      getCommitCharacterType({
        data: " ",
        inputValue: "tes",
        targetWord: "test",
      }),
    ).toBe("separator");
  });

  it.each([
    ["　", "ideographic"],
    [" ", "non-breaking"],
    [" ", "em"],
    ["​", "zero width"],
  ])("returns 'separator' for %s (%s space)", (data) => {
    expect(
      getCommitCharacterType({ data, inputValue: "tes", targetWord: "test" }),
    ).toBe("separator");
  });

  it("returns 'separator' for a newline", () => {
    expect(
      getCommitCharacterType({
        data: "\n",
        inputValue: "tes",
        targetWord: "test",
      }),
    ).toBe("separator");
  });

  it("returns false for a regular letter when nospace is inactive", () => {
    expect(
      getCommitCharacterType({
        data: "t",
        inputValue: "tes",
        targetWord: "test",
      }),
    ).toBe(false);
    expect(isFunboxActiveWithProperty).toHaveBeenCalledWith("nospace");
  });

  describe("nospace funbox", () => {
    beforeEach(() => {
      isFunboxActiveWithProperty.mockReturnValue(true);
    });

    it("returns 'nospace' when the char completes the target word", () => {
      expect(
        getCommitCharacterType({
          data: "t",
          inputValue: "tes",
          targetWord: "test",
        }),
      ).toBe("nospace");
    });

    it("returns false when the word is not yet complete", () => {
      expect(
        getCommitCharacterType({
          data: "s",
          inputValue: "te",
          targetWord: "test",
        }),
      ).toBe(false);
    });

    it("returns false when input already exceeds the target length", () => {
      expect(
        getCommitCharacterType({
          data: "x",
          inputValue: "test",
          targetWord: "test",
        }),
      ).toBe(false);
    });

    it("still returns 'separator' for a space", () => {
      expect(
        getCommitCharacterType({
          data: " ",
          inputValue: "tes",
          targetWord: "test",
        }),
      ).toBe("separator");
    });
  });

  describe("bopomofo", () => {
    beforeEach(() => {
      __testing.replaceConfig({ language: "bopomofo" });
    });

    it("commits the syllable on its tone mark", () => {
      expect(
        getCommitCharacterType({
          data: "ˊ",
          inputValue: "ㄇㄟ",
          targetWord: "ㄇㄟˊ",
        }),
      ).toBe("tone");
    });

    it("commits on a wrong tone mark too", () => {
      expect(
        getCommitCharacterType({
          data: "ˇ",
          inputValue: "ㄇ",
          targetWord: "ㄇㄟˊ",
        }),
      ).toBe("tone");
    });

    it("does not commit on a symbol that fills the target length", () => {
      expect(
        getCommitCharacterType({
          data: "ㄢ",
          inputValue: "ㄇㄟ",
          targetWord: "ㄇㄟˊ",
        }),
      ).toBe(false);
    });

    it("commits a punctuation unit on its first key", () => {
      expect(
        getCommitCharacterType({
          data: "，",
          inputValue: "",
          targetWord: "，",
        }),
      ).toBe("tone");
    });

    it("ignores tone marks outside bopomofo languages", () => {
      __testing.replaceConfig({ language: "english" });
      expect(
        getCommitCharacterType({
          data: "ˊ",
          inputValue: "ab",
          targetWord: "abc",
        }),
      ).toBe(false);
    });
  });
});
