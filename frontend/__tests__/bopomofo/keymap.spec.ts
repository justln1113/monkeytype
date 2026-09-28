import { describe, it, expect } from "vitest";
import { createKeyReader, type KeyLike } from "../../src/ts/bopomofo/keymap";

type Mods = Partial<{
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}>;
const key = (code: string, mods: Mods = {}): KeyLike => ({
  code,
  shiftKey: mods.shift ?? false,
  ctrlKey: mods.ctrl ?? false,
  altKey: mods.alt ?? false,
  metaKey: mods.meta ?? false,
});

describe("createKeyReader", () => {
  it("maps physical keys to bopomofo on the standard (Dai-Chien) layout", () => {
    const read = createKeyReader();
    expect(read(key("KeyJ"))).toEqual({ type: "symbol", char: "ㄨ" });
    expect(read(key("KeyI"))).toEqual({ type: "symbol", char: "ㄛ" });
    expect(read(key("Digit3"))).toEqual({ type: "symbol", char: "ˇ" });
    expect(read(key("Slash"))).toEqual({ type: "symbol", char: "ㄥ" });
  });

  it("treats Space as the first tone", () => {
    expect(createKeyReader()(key("Space"))).toEqual({
      type: "symbol",
      char: "ˉ",
    });
  });

  it.each([
    // Ctrl scheme (Microsoft Bopomofo)
    ["Comma", { ctrl: true }, "，"],
    ["Period", { ctrl: true }, "。"],
    ["Quote", { ctrl: true }, "、"],
    ["Semicolon", { ctrl: true }, "；"],
    ["Semicolon", { ctrl: true, shift: true }, "："],
    ["Slash", { ctrl: true, shift: true }, "？"],
    ["Digit1", { ctrl: true, shift: true }, "！"],
    // Shift scheme (McBopomofo / chewing / macOS)
    ["Comma", { shift: true }, "，"],
    ["Period", { shift: true }, "。"],
    ["Slash", { shift: true }, "？"],
    ["Semicolon", { shift: true }, "："],
    ["Quote", { shift: true }, "；"],
    ["Digit1", { shift: true }, "！"],
    ["Digit9", { shift: true }, "（"],
    ["Digit0", { shift: true }, "）"],
    ["BracketLeft", { shift: true }, "『"],
    ["BracketRight", { shift: true }, "』"],
    ["Minus", { shift: true }, "—"],
    // unmodified keys that are not bopomofo keys
    ["BracketLeft", {}, "「"],
    ["BracketRight", {}, "」"],
    ["Quote", {}, "、"],
  ] as const)("reads %s %o as %s", (code, mods, char) => {
    expect(createKeyReader()(key(code, mods))).toEqual({ type: "punct", char });
  });

  it("reads backtick-prefixed punctuation", () => {
    const read = createKeyReader();
    expect(read(key("Backquote"))).toEqual({ type: "pending" });
    expect(read(key("Period"))).toEqual({ type: "punct", char: "。" });
    // the prefix is consumed: the next Period is ㄡ again
    expect(read(key("Period"))).toEqual({ type: "symbol", char: "ㄡ" });
  });

  it("falls back to the plain key when the backtick is not followed by punctuation", () => {
    const read = createKeyReader();
    read(key("Backquote"));
    expect(read(key("KeyJ"))).toEqual({ type: "symbol", char: "ㄨ" });
  });

  it("leaves unrelated modifier combos to the browser", () => {
    const read = createKeyReader();
    expect(read(key("KeyC", { ctrl: true }))).toBeNull();
    expect(read(key("KeyJ", { shift: true }))).toBeNull();
    expect(read(key("KeyJ", { alt: true }))).toBeNull();
    expect(read(key("Comma", { meta: true }))).toBeNull();
  });
});
