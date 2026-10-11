import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CONFIG,
  accuracy,
  consistency,
  countChars,
  generateWords,
  letterStates,
  wpmFrom,
} from "./typing.ts";

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

test("letterStates marks correct, incorrect, untyped and extra letters", () => {
  assert.deepEqual(
    letterStates("come", "cmoex").map((l) => l.state),
    ["correct", "incorrect", "incorrect", "correct", "extra"],
  );
  assert.deepEqual(letterStates("hi", undefined).map((l) => l.state), ["untyped", "untyped"]);
  assert.deepEqual(letterStates("home", "h").map((l) => l.state), ["correct", "untyped", "untyped", "untyped"]);
});

test("countChars matches monkeytype's characters stat", () => {
  // "it" correct, "come" typed "cmoe", "too" typed "tooxx", "home" in progress "h"
  const c = countChars(["it", "come", "too", "home"], ["it", "cmoe", "tooxx", "h"], false);
  assert.equal(c.incorrect, 2);
  assert.equal(c.extra, 2);
  assert.equal(c.missed, 0);
  // it(2) + space + c,e + t,o,o + h = 9 letters + 1 space after the only correct word
  assert.equal(c.correct, 9);
  assert.equal(c.correctWordChars, 3 + 1); // "it " + in-progress "h"
});

test("countChars counts missed letters of skipped-over words", () => {
  const c = countChars(["hello", "world"], ["he", "w"], false);
  assert.equal(c.missed, 3);
});

test("wpm, accuracy and consistency formulas", () => {
  assert.equal(wpmFrom(50, 60), 10);
  assert.equal(wpmFrom(197, 15), 157.6);
  assert.equal(accuracy(0, 0), 0);
  assert.equal(Math.round(accuracy(203, 205) * 100) / 100, 99.02);
  assert.equal(consistency([100, 100, 100]), 100);
  assert.ok(consistency([0, 600, 0, 600]) < 30);
});

test("generateWords respects count, numbers and punctuation", () => {
  const list = ["the", "be", "of", "and"];
  const plain = generateWords(DEFAULT_CONFIG, list, 50, seeded(1));
  assert.equal(plain.length, 50);
  assert.ok(plain.every((w) => list.includes(w)));
  plain.slice(1).forEach((w, i) => assert.notEqual(w, plain[i]));

  const punct = generateWords({ ...DEFAULT_CONFIG, punctuation: true }, list, 50, seeded(2));
  assert.match(punct[0], /^["(]?[A-Z]/);
  assert.match(punct[punct.length - 1], /[.?!]["')]?$/);

  const nums = generateWords({ ...DEFAULT_CONFIG, numbers: true }, list, 200, seeded(3));
  assert.ok(nums.some((w) => /^\d+$/.test(w)));
});
