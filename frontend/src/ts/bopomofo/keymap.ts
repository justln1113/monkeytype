/**
 * Physical key → bopomofo, standard (Dai-Chien 大千) layout.
 * Keyed by KeyboardEvent.code so the OS keyboard layout does not matter.
 */

export type KeyLike = Pick<
  KeyboardEvent,
  "code" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey"
>;

export type KeyResult =
  | { type: "symbol"; char: string }
  | { type: "punct"; char: string }
  | { type: "pending" };

export const TONE1 = "ˉ";

const SYMBOLS: Record<string, string> = {
  Digit1: "ㄅ",
  Digit2: "ㄉ",
  Digit3: "ˇ",
  Digit4: "ˋ",
  Digit5: "ㄓ",
  Digit6: "ˊ",
  Digit7: "˙",
  Digit8: "ㄚ",
  Digit9: "ㄞ",
  Digit0: "ㄢ",
  Minus: "ㄦ",
  KeyQ: "ㄆ",
  KeyW: "ㄊ",
  KeyE: "ㄍ",
  KeyR: "ㄐ",
  KeyT: "ㄔ",
  KeyY: "ㄗ",
  KeyU: "ㄧ",
  KeyI: "ㄛ",
  KeyO: "ㄟ",
  KeyP: "ㄣ",
  KeyA: "ㄇ",
  KeyS: "ㄋ",
  KeyD: "ㄎ",
  KeyF: "ㄑ",
  KeyG: "ㄕ",
  KeyH: "ㄘ",
  KeyJ: "ㄨ",
  KeyK: "ㄜ",
  KeyL: "ㄠ",
  Semicolon: "ㄤ",
  KeyZ: "ㄈ",
  KeyX: "ㄌ",
  KeyC: "ㄏ",
  KeyV: "ㄒ",
  KeyB: "ㄖ",
  KeyN: "ㄙ",
  KeyM: "ㄩ",
  Comma: "ㄝ",
  Period: "ㄡ",
  Slash: "ㄥ",
  Space: TONE1,
};

// Full-width punctuation. Three input schemes are accepted side by side;
// they never collide because , . ; / - are bopomofo keys when unmodified.
// Ctrl scheme and backtick prefix: Microsoft Bopomofo, where Shift+symbol
// yields half-width. Shift scheme: McBopomofo, chewing, macOS.
const PUNCT_CTRL: Record<string, string> = {
  Comma: "，",
  Period: "。",
  Quote: "、",
  Semicolon: "；",
  "S+Semicolon": "：",
  "S+Slash": "？",
  "S+Digit1": "！",
};
const PUNCT_BACKTICK = PUNCT_CTRL;
const PUNCT_SHIFT: Record<string, string> = {
  Comma: "，",
  Period: "。",
  Slash: "？",
  Semicolon: "：",
  Quote: "；",
  Digit1: "！",
  Digit9: "（",
  Digit0: "）",
  BracketLeft: "『",
  BracketRight: "』",
  Minus: "—",
};
const PUNCT_PLAIN: Record<string, string> = {
  BracketLeft: "「",
  BracketRight: "」",
  Quote: "、",
};

const punct = (char: string | undefined): KeyResult | null =>
  char === undefined ? null : { type: "punct", char };

/** Stateful because of the backtick prefix; create one per input session. */
export function createKeyReader(): (event: KeyLike) => KeyResult | null {
  let backtickPending = false;
  return (event) => {
    if (event.altKey || event.metaKey) return null;
    const combo = (event.shiftKey ? "S+" : "") + event.code;

    if (backtickPending) {
      backtickPending = false;
      const result = event.ctrlKey ? null : punct(PUNCT_BACKTICK[combo]);
      if (result) return result;
    }
    if (event.ctrlKey) return punct(PUNCT_CTRL[combo]);
    if (event.shiftKey) return punct(PUNCT_SHIFT[event.code]);
    if (event.code === "Backquote") {
      backtickPending = true;
      return { type: "pending" };
    }
    const plain = punct(PUNCT_PLAIN[event.code]);
    if (plain) return plain;
    const char = SYMBOLS[event.code];
    return char === undefined ? null : { type: "symbol", char };
  };
}
