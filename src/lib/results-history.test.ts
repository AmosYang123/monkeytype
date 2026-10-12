import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { filterOf, getAverage10, getDailyAverage, getPb, getResults, saveResult } from "./results-history.ts";
import { DEFAULT_CONFIG } from "./typing.ts";

const store = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
  configurable: true,
});
beforeEach(() => store.clear());

test("average of the 10 newest matching results, rounded; 0 when none", () => {
  assert.equal(getAverage10(filterOf(DEFAULT_CONFIG)), 0);
  for (let i = 0; i < 12; i++) saveResult(DEFAULT_CONFIG, 100 + i, 100, i);
  saveResult({ ...DEFAULT_CONFIG, time: 60 }, 999, 100, 99);
  saveResult({ ...DEFAULT_CONFIG, punctuation: true }, 999, 100, 100);
  // newest 10 matching: 102..111 => mean 106.5 => 107
  assert.equal(getAverage10(filterOf(DEFAULT_CONFIG)), 107);
});

test("history is capped at 200, newest last", () => {
  for (let i = 0; i < 205; i++) saveResult(DEFAULT_CONFIG, i, 100, i);
  const all = getResults();
  assert.equal(all.length, 200);
  assert.equal(all.at(-1)?.wpm, 204);
  assert.equal(all[0].wpm, 5);
});

test("corrupt or malformed storage is ignored", () => {
  store.set("results", "{not json");
  assert.deepEqual(getResults(), []);
  store.set("results", JSON.stringify([{ wpm: "x" }, null, 5]));
  assert.deepEqual(getResults(), []);
  saveResult(DEFAULT_CONFIG, 80, 95, 1);
  assert.equal(getAverage10(filterOf(DEFAULT_CONFIG)), 80);
});

test("extra fields are saved when valid and dropped when not", () => {
  saveResult(DEFAULT_CONFIG, 90, 97, 1, { raw: 95, consistency: 80, seconds: 30 });
  saveResult(DEFAULT_CONFIG, 91, 97, 2, { raw: Number.NaN });
  const [a, b] = getResults();
  assert.equal(a.raw, 95);
  assert.equal(a.seconds, 30);
  assert.equal("raw" in b, false);
});

test("personal best is the highest matching wpm", () => {
  assert.equal(getPb(filterOf(DEFAULT_CONFIG)), undefined);
  saveResult(DEFAULT_CONFIG, 90, 97, 1);
  saveResult(DEFAULT_CONFIG, 120, 95, 2);
  saveResult(DEFAULT_CONFIG, 100, 99, 3);
  saveResult({ ...DEFAULT_CONFIG, time: 60 }, 200, 100, 4);
  assert.equal(getPb(filterOf(DEFAULT_CONFIG))?.wpm, 120);
  assert.equal(getPb(filterOf(DEFAULT_CONFIG))?.timestamp, 2);
});

test("daily average only counts today's results", () => {
  const now = new Date(2026, 9, 12, 15).getTime();
  const yesterday = new Date(2026, 9, 11, 23).getTime();
  saveResult(DEFAULT_CONFIG, 200, 100, yesterday);
  saveResult(DEFAULT_CONFIG, 80, 100, new Date(2026, 9, 12, 9).getTime());
  saveResult(DEFAULT_CONFIG, 91, 100, new Date(2026, 9, 12, 14).getTime());
  assert.equal(getDailyAverage(filterOf(DEFAULT_CONFIG), now), 86);
  assert.equal(getDailyAverage(filterOf({ ...DEFAULT_CONFIG, time: 60 }), now), 0);
});
