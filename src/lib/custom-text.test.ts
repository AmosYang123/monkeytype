import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CUSTOM_TEXT, parseCustomTextSettings } from "./custom-text.ts";

test("parseCustomTextSettings keeps valid fields and defaults the rest", () => {
  assert.deepEqual(parseCustomTextSettings(null), DEFAULT_CUSTOM_TEXT);
  assert.deepEqual(parseCustomTextSettings("x"), DEFAULT_CUSTOM_TEXT);
  const p = parseCustomTextSettings({ text: ["a", "b"], mode: "shuffle", limit: { value: 30, mode: "time" }, pipeDelimiter: true });
  assert.deepEqual(p, { text: ["a", "b"], mode: "shuffle", limit: { value: 30, mode: "time" }, pipeDelimiter: true });
  const bad = parseCustomTextSettings({ text: [1, 2], mode: "nope", limit: { value: -1, mode: "?" } });
  assert.deepEqual(bad, DEFAULT_CUSTOM_TEXT);
});
