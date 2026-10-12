import { test } from "node:test";
import assert from "node:assert/strict";
import { describeResult, formatDuration, personalBests, resultsCsv, rollingAverage, totals } from "./account-stats.ts";
import type { SavedResult } from "./results-history.ts";

const r = (patch: Partial<SavedResult>): SavedResult => ({
  mode: "time", mode2: "30", punctuation: false, numbers: false, language: "english", difficulty: "normal", lazyMode: false,
  wpm: 80, acc: 95, timestamp: 0, ...patch,
});

test("personal bests per slot, best wpm wins, empty slots undefined", () => {
  const pbs = personalBests([r({ wpm: 80 }), r({ wpm: 95, punctuation: true }), r({ mode: "words", mode2: "25", wpm: 70 })]);
  assert.equal(pbs["time 30"]?.wpm, 95);
  assert.equal(pbs["words 25"]?.wpm, 70);
  assert.equal(pbs["time 15"], undefined);
});

test("totals fall back to the time-mode length when duration is missing", () => {
  const t = totals([r({ wpm: 60, acc: 90 }), r({ mode: "words", mode2: "10", wpm: 100, acc: 100, seconds: 6.5 }), r({ mode: "words", mode2: "10" })]);
  assert.equal(t.tests, 3);
  assert.equal(t.seconds, 36.5);
  assert.equal(t.best, 100);
  assert.equal(totals([]).avgWpm, 0);
});

test("rolling average over a window", () => {
  assert.deepEqual(rollingAverage([10, 20, 30, 40], 2), [10, 15, 25, 35]);
});

test("formatting helpers", () => {
  assert.equal(formatDuration(42), "42s");
  assert.equal(formatDuration(125), "2m 05s");
  assert.equal(formatDuration(3723), "1h 02m 03s");
  assert.equal(describeResult(r({ punctuation: true, language: "english_1k" })), "time 30 · english 1k · punctuation");
  assert.equal(describeResult(r({ mode: "zen", mode2: "zen" })), "zen · english");
});

test("csv has a header and escapes values", () => {
  const csv = resultsCsv([r({ language: 'a,"b"', timestamp: Date.UTC(2026, 0, 1) })]).split("\n");
  assert.equal(csv[0].split(",")[0], "timestamp");
  assert.match(csv[1], /^2026-01-01T00:00:00.000Z,time,30,"a,""b""",false/);
});
