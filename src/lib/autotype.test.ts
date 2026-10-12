import { test } from "node:test";
import assert from "node:assert/strict";
import { autotypeKey, msPerKey, parseSesame, type AutotypeCursor } from "./autotype.ts";
import { countChars, wpmFrom } from "./typing.ts";

test("parseSesame: open/close in any case and spacing, optional speed", () => {
  assert.deepEqual(parseSesame("open sesame"), { type: "open", wpm: 150 });
  assert.deepEqual(parseSesame("  OPEN   Sesame \n"), { type: "open", wpm: 150 });
  assert.deepEqual(parseSesame("open sesame 120"), { type: "open", wpm: 120 });
  assert.deepEqual(parseSesame("open sesame 9999"), { type: "open", wpm: 300 });
  assert.deepEqual(parseSesame("open sesame 1"), { type: "open", wpm: 10 });
  assert.deepEqual(parseSesame("Close  sesame"), { type: "close" });
  assert.equal(parseSesame("open sesame please"), null);
  assert.equal(parseSesame("the quick brown fox"), null);
  assert.equal(parseSesame(""), null);
});

test("150 wpm = 80 ms per key", () => {
  assert.equal(msPerKey(150), 80);
});

test("autotypeKey types each letter then a space, null past the end", () => {
  const words = ["hi", "yo"];
  let c: AutotypeCursor = { word: 0, char: 0 };
  const keys: string[] = [];
  for (let step = autotypeKey(words, c); step; step = autotypeKey(words, c)) {
    keys.push(step.key);
    c = step.next;
  }
  assert.equal(keys.join(""), "hi yo ");
});

test("a 15s run at the scheduled pace scores 150 wpm", () => {
  const words = Array.from({ length: 100 }, (_, i) => ["the", "quick", "brown", "fox", "jumps"][i % 5]);
  const inputs = [""];
  let c: AutotypeCursor = { word: 0, char: 0 };
  // keys fire at 0, 80, 160 ... ms; the test stops at 15000 ms
  for (let t = 0; t < 15_000; t += msPerKey(150)) {
    const step = autotypeKey(words, c);
    assert.ok(step);
    if (step.key === " ") inputs.push("");
    else inputs[inputs.length - 1] += step.key;
    c = step.next;
  }
  const wpm = wpmFrom(countChars(words, inputs, false).correctWordChars, 15);
  assert.ok(Math.abs(wpm - 150) <= 1, `wpm ${wpm}`);
});
