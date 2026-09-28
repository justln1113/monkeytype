const el = document.querySelector("#wordsInput") as HTMLTextAreaElement;

if (el === null) {
  throw new Error("Words input element not found");
}

// Bopomofo mode takes keys through a password field instead: IMEs do not
// compose there, so the physical keys reach the page. The textarea still
// holds the input value the handlers read and write.
const captureEl = document.querySelector<HTMLInputElement>(
  "#wordsInputBopomofo",
);
let captureActive = false;

export function getInputElement(): HTMLTextAreaElement {
  return el;
}

export function getKeyCaptureElement(): HTMLInputElement | null {
  return captureEl;
}

export function setBopomofoCapture(active: boolean): void {
  const wasFocused = isInputElementFocused();
  captureActive = active && captureEl !== null;
  if (wasFocused) focusInputElement(true);
}

function focusTarget(): HTMLElement {
  return captureActive && captureEl !== null ? captureEl : el;
}

export function setInputElementValue(value: string): void {
  el.value = ` ${value}`;
}

export function appendToInputElementValue(value: string): void {
  el.value += value;
}

export function getInputElementValue(): {
  inputValue: string;
  realInputValue: string;
} {
  return {
    inputValue: el.value.slice(1),
    realInputValue: el.value,
  };
}

export function moveInputElementCaretToTheEnd(): void {
  el.setSelectionRange(el.value.length, el.value.length);
}

export function replaceInputElementLastValueChar(char: string): void {
  const { inputValue } = getInputElementValue();
  setInputElementValue(inputValue.slice(0, -1) + char);
}

export function isInputElementFocused(): boolean {
  return (
    document.activeElement === el ||
    (captureActive && document.activeElement === captureEl)
  );
}

export function focusInputElement(preventScroll = false): void {
  focusTarget().focus({
    preventScroll,
  });
}

export function blurInputElement(): void {
  el.blur();
  captureEl?.blur();
}
