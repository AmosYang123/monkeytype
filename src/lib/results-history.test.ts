import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { filterOf, getAverage10, getResults, saveResult } from "./results-history.ts";
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
