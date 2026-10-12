import { test } from "node:test";
import assert from "node:assert/strict";
import { customWords, engineConfig } from "./engine-config.ts";
import { getDefaultConfig } from "./config/defaults.ts";
import { DEFAULT_CUSTOM_TEXT } from "./custom-text.ts";

test("persisted numeric quote groups map to the public engine contract", () => {
  assert.equal(engineConfig(getDefaultConfig()).quoteLength, "medium");
  assert.equal(engineConfig({ ...getDefaultConfig(), quoteLength: [-2], language: "spanish" }).language, "spanish");
  assert.equal(engineConfig({ ...getDefaultConfig(), quoteLength: [-3] }).quoteLength, "all");
});

test("custom repeat and random modes respect word limit and have an empty-text fallback", () => {
  const settings = { ...DEFAULT_CUSTOM_TEXT, text: ["a", "b"], limit: { value: 5, mode: "word" as const } };
  assert.deepEqual(customWords(settings), ["a", "b", "a", "b", "a"]);
  assert.deepEqual(customWords({ ...settings, mode: "random" }, () => 0), ["a", "a", "a", "a", "a"]);
  assert.ok(customWords({ ...settings, text: [] }).length > 0);
});

test("custom shuffle does not mutate the saved source", () => {
  const settings = { ...DEFAULT_CUSTOM_TEXT, mode: "shuffle" as const };
  const before = [...settings.text];
  customWords(settings, () => 0);
  assert.deepEqual(settings.text, before);
});


test("pipe-delimited custom sections cap sections and type their whitespace-separated words", () => {
  assert.deepEqual(customWords({ ...DEFAULT_CUSTOM_TEXT, text: ["hello world", "second section"], pipeDelimiter: true, limit: { mode: "section", value: 1 } }), ["hello", "world"]);
});
