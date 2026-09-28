import { getInputElement, getKeyCaptureElement } from "../input-element";
import { onKeyup } from "../handlers/keyup";
import { onKeydown } from "../handlers/keydown";

const inputEls: (HTMLElement | null)[] = [
  getInputElement(),
  getKeyCaptureElement(),
];

for (const inputEl of inputEls) {
  inputEl?.addEventListener("keyup", async (event) => {
    console.debug("wordsInput event keyup", {
      event,
      key: event.key,
      code: event.code,
    });

    await onKeyup(event);
  });

  inputEl?.addEventListener("keydown", async (event) => {
    console.debug("wordsInput event keydown", {
      event,
      key: event.key,
      code: event.code,
    });

    await onKeydown(event);
  });
}
