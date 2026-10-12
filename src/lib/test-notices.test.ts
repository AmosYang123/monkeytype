import { test } from "node:test";
import assert from "node:assert/strict";
import { testNotices } from "./test-notices.ts";
import { getDefaultConfig } from "./config/defaults.ts";

const prefs = { ...getDefaultConfig(), minWpm: "custom", minWpmCustomSpeed: 50, minBurst: "flex", minBurstCustomSpeed: 50, paceCaret: "average" } as const;

test("user prefs show language, average pace 0, min speed and flex burst", () => {
  assert.deepEqual(testNotices(prefs).map((n) => [n.icon, n.text, n.subgroup]), [
    ["globe-americas", "english", "language"],
    ["tachometer-alt", "average pace 0 wpm", "paceCaret"],
    ["bomb", "min 50 wpm", "minWpm"],
    ["bomb", "min 50 wpm burst (flex)", "minBurst"],
  ]);
});

test("average pace shows the rounded average, and 0 when it is NaN", () => {
  assert.equal(testNotices(prefs, 87)[1].text, "average pace 87 wpm");
  assert.equal(testNotices(prefs, 87.6)[1].text, "average pace 88 wpm");
  assert.equal(testNotices(prefs, Number.NaN)[1].text, "average pace 0 wpm");
});

test("no average pace notice unless paceCaret is average", () => {
  assert.equal(testNotices({ ...prefs, paceCaret: "off" }, 87).some((n) => n.text.startsWith("average pace")), false);
});

test("fixed burst has no flex suffix; zen hides language", () => {
  const texts = testNotices({ ...prefs, minBurst: "fixed", mode: "zen", paceCaret: "off" }).map((n) => n.text);
  assert.deepEqual(texts, ["min 50 wpm", "min 50 wpm burst"]);
});

test("repeated notice is red, first, not clickable, and skipped for quotes", () => {
  const [first] = testNotices(prefs, 0, true);
  assert.deepEqual([first.icon, first.text, first.subgroup, first.error], ["sync-alt", "repeated", undefined, true]);
  assert.equal(testNotices({ ...prefs, mode: "quote" }, 0, true).some((n) => n.text === "repeated"), false);
  assert.equal(testNotices(prefs).some((n) => n.text === "repeated"), false);
});
