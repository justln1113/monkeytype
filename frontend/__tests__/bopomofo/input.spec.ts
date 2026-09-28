import { describe, it, expect } from "vitest";
import {
  bopomofoKeyAction,
  isBopomofoInputBlocked,
} from "../../src/ts/bopomofo/input";
import { createKeyReader, type KeyLike } from "../../src/ts/bopomofo/keymap";

function key(
  code: string,
  mods: Partial<KeyLike> = {},
  extra: { key?: string; isComposing?: boolean } = {},
): KeyLike & { key: string; isComposing: boolean } {
  return {
    code,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    key: extra.key ?? "x",
    isComposing: extra.isComposing ?? false,
    ...mods,
  };
}

describe("isBopomofoInputBlocked", () => {
  const blocked = (
    data: string,
    inputValue: string,
    targetWord: string,
  ): boolean => isBopomofoInputBlocked({ data, inputValue, targetWord });

  it("blocks real spaces, tone 1 is typed as ˉ", () => {
    expect(blocked(" ", "ㄇㄟ", "ㄇㄟˊ")).toBe(true);
  });

  it("blocks a tone mark before any symbol", () => {
    expect(blocked("ˊ", "", "ㄇㄟˊ")).toBe(true);
  });

  it("lets symbols and tones through", () => {
    expect(blocked("ㄇ", "", "ㄇㄟˊ")).toBe(false);
    expect(blocked("ˊ", "ㄇㄟ", "ㄇㄟˊ")).toBe(false);
  });

  it("blocks a fifth symbol but still takes the tone", () => {
    expect(blocked("ㄚ", "ㄇㄟㄢㄤ", "ㄇㄟˊ")).toBe(true);
    expect(blocked("ˊ", "ㄇㄟㄢㄤ", "ㄇㄟˊ")).toBe(false);
  });

  it("lets a punctuation unit take its key on empty input", () => {
    expect(blocked("，", "", "，")).toBe(false);
  });
});

describe("bopomofoKeyAction", () => {
  it("inserts the symbol for a mapped key", () => {
    const read = createKeyReader();
    expect(bopomofoKeyAction(key("KeyJ"), read)).toEqual({
      type: "insert",
      data: "ㄨ",
    });
  });

  it("inserts tone 1 for space", () => {
    const read = createKeyReader();
    expect(bopomofoKeyAction(key("Space", {}, { key: " " }), read)).toEqual({
      type: "insert",
      data: "ˉ",
    });
  });

  it("inserts full-width punctuation for its combo", () => {
    const read = createKeyReader();
    expect(bopomofoKeyAction(key("Comma", { ctrlKey: true }), read)).toEqual({
      type: "insert",
      data: "，",
    });
  });

  it("reports an active IME instead of typing", () => {
    const read = createKeyReader();
    expect(
      bopomofoKeyAction(key("KeyJ", {}, { key: "Process" }), read),
    ).toEqual({ type: "ime" });
    expect(
      bopomofoKeyAction(key("KeyJ", {}, { isComposing: true }), read),
    ).toEqual({ type: "ime" });
  });

  it("swallows the backtick prefix", () => {
    const read = createKeyReader();
    expect(bopomofoKeyAction(key("Backquote"), read)).toEqual({
      type: "swallow",
    });
    expect(bopomofoKeyAction(key("Comma"), read)).toEqual({
      type: "insert",
      data: "，",
    });
  });

  it("leaves unmapped keys to the regular handlers", () => {
    const read = createKeyReader();
    expect(bopomofoKeyAction(key("Tab", {}, { key: "Tab" }), read)).toBe(null);
    expect(bopomofoKeyAction(key("KeyR", { ctrlKey: true }), read)).toBe(null);
  });
});
