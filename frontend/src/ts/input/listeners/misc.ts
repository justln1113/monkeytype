import {
  getInputElement,
  getKeyCaptureElement,
  moveInputElementCaretToTheEnd,
} from "../input-element";

const inputEl = getInputElement();

// the capture field only relays keys; whatever lands in it is discarded
getKeyCaptureElement()?.addEventListener("input", (event) => {
  (event.target as HTMLInputElement).value = "";
});

inputEl.addEventListener("focus", () => {
  moveInputElementCaretToTheEnd();
});

inputEl.addEventListener("copy paste", (event) => {
  event.preventDefault();
});

//this might not do anything
inputEl.addEventListener("select selectstart", (event) => {
  event.preventDefault();
});

inputEl.addEventListener("selectionchange", (event) => {
  const selection = window.getSelection();

  console.debug("wordsInput event selectionchange", {
    event,
    selection: selection?.toString(),
    isCollapsed: selection?.isCollapsed,
    selectionStart: inputEl.selectionStart,
    selectionEnd: inputEl.selectionEnd,
  });

  const hasSelectedText = inputEl.selectionStart !== inputEl.selectionEnd;
  const isCursorAtEnd = inputEl.selectionStart === inputEl.value.length;
  if (hasSelectedText || !isCursorAtEnd) {
    moveInputElementCaretToTheEnd();
  }
});
