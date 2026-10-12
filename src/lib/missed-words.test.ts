import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { addMissedWords, getMissedBank, mostMissed } from "./missed-words.ts";

const store = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
  configurable: true,
});
beforeEach(() => store.clear());

test("counts misses per test and orders by count", () => {
  addMissedWords(["the", "the", "fox"]);
  addMissedWords(["fox", "dog"]);
  assert.deepEqual(getMissedBank(), { the: 1, fox: 2, dog: 1 });
  assert.equal(mostMissed()[0], "fox");
  assert.deepEqual(mostMissed(1), ["fox"]);
});

test("capped at 500, dropping the least missed", () => {
  addMissedWords(["keep"]);
  addMissedWords(["keep"]);
  addMissedWords(Array.from({ length: 510 }, (_, i) => `w${i}`));
  const bank = getMissedBank();
  assert.equal(Object.keys(bank).length, 500);
  assert.equal(bank.keep, 2);
});

test("corrupt storage is ignored", () => {
  store.set("missedWords", "[1,2]");
  assert.deepEqual(getMissedBank(), {});
  store.set("missedWords", JSON.stringify({ ok: 3, bad: "x", neg: -1 }));
  assert.deepEqual(getMissedBank(), { ok: 3 });
});
