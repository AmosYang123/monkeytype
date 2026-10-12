import { test } from "node:test";
import assert from "node:assert/strict";
import { focusTypingOnKey, type TypingKeyEvent } from "./typing-focus.ts";

const key = (value: string, patch: Partial<TypingKeyEvent> = {}): TypingKeyEvent => ({
  key: value, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, preventDefault() {}, ...patch,
});

test("the focusing keystroke is forwarded exactly once after focus", () => {
  const calls: string[] = [];
  focusTypingOnKey(key("h"), false, () => calls.push("focus"), (event) => calls.push(event.key));
  assert.deepEqual(calls, ["focus", "h"]);
});

test("interactive targets and shortcuts do not start typing", () => {
  let calls = 0;
  const called = () => { calls++; };
  focusTypingOnKey(key("h"), true, called, called);
  for (const event of [key("Tab"), key("Enter"), key("p", { ctrlKey: true }), key("c", { metaKey: true }), key("a", { altKey: true })]) {
    focusTypingOnKey(event, false, called, called);
  }
  assert.equal(calls, 0);
});
