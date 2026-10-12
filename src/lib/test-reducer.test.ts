import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState, testReducer, type TestAction, type TestState } from "./test-reducer.ts";
import { DEFAULT_CONFIG, flexBurstThreshold } from "./typing.ts";

const run = (s: TestState, actions: TestAction[]) => actions.reduce(testReducer, s);
const type = (text: string, start: number, msPerKey = 100): TestAction[] =>
  [...text].map((ch, k) =>
    ch === " " ? { type: "space", now: start + k * msPerKey } : { type: "char", char: ch, now: start + k * msPerKey },
  );

test("words mode finishes when the last word is typed correctly", () => {
  const s = run(initialState({ ...DEFAULT_CONFIG, mode: "words", words: 2 }, ["hi", "yo"]), type("hi yo", 0));
  assert.equal(s.finished, true);
  assert.equal(s.result?.acc, 100);
  assert.equal(s.result?.chars.correct, 5);
});

test("time mode finishes on the tick that reaches the configured time", () => {
  let s = run(initialState({ ...DEFAULT_CONFIG, time: 15 }, ["a", "b", "c"]), type("a b", 0));
  s = testReducer(s, { type: "tick", now: 14_000 });
  assert.equal(s.finished, false);
  s = testReducer(s, { type: "tick", now: 15_000 });
  assert.equal(s.finished, true);
  assert.equal(s.result?.seconds, 15);
  assert.equal(s.result?.chart.labels.length, 15);
});

test("backspace only steps back into a word with a mistake", () => {
  const base = initialState({ ...DEFAULT_CONFIG, mode: "words", words: 3 }, ["ab", "cd", "ef"]);
  const locked = run(base, [...type("ab ", 0), { type: "backspace", word: false, now: 0 }]);
  assert.deepEqual(locked.inputs, ["ab", ""]);
  const open = run(base, [...type("ax ", 0), { type: "backspace", word: false, now: 0 }]);
  assert.deepEqual(open.inputs, ["ax"]);
  const wordDel = testReducer(open, { type: "backspace", word: true, now: 0 });
  assert.deepEqual(wordDel.inputs, [""]);
});

test("extra letters are capped and leading spaces ignored", () => {
  let s = initialState(DEFAULT_CONFIG, ["a", "b"]);
  s = testReducer(s, { type: "space", now: 0 });
  assert.deepEqual(s.inputs, [""]);
  s = run(s, type("a".repeat(40), 0, 1));
  assert.equal(s.inputs[0].length, 21);
});


test("master fails on first incorrect letter and expert fails on committing an incorrect word", () => {
  const master = run(initialState({ ...DEFAULT_CONFIG, difficulty: "master" }, ["hi"]), type("x", 0));
  assert.equal(master.result?.failed, true);
  assert.equal(master.result?.seconds, 0);
  const expert = run(initialState({ ...DEFAULT_CONFIG, difficulty: "expert" }, ["hi"]), type("hx ", 0));
  assert.equal(expert.result?.failReason, "expert difficulty");
});

test("stop on error counts a rejected key while keeping the next letter in place", () => {
  const s = run(initialState({ ...DEFAULT_CONFIG, stopOnError: "letter" }, ["hi"]), type("hx", 0));
  assert.deepEqual(s.inputs, ["h"]);
  assert.equal(s.keys.total, 2);
  assert.equal(s.keys.correct, 1);
});

test("freedom allows returning to a correct word and confidence max disables deletion", () => {
  const s = run(initialState({ ...DEFAULT_CONFIG, freedomMode: true }, ["hi", "yo"]), [...type("hi ", 0), { type: "backspace", word: false, now: 0 }]);
  assert.deepEqual(s.inputs, ["hi"]);
  const locked = testReducer({ ...s, config: { ...s.config, confidenceMode: "max" } }, { type: "backspace", word: false, now: 0 });
  assert.deepEqual(locked.inputs, ["hi"]);
});

test("quick end completes an incorrect last word and minimum accuracy ends early", () => {
  const fast = run(initialState({ ...DEFAULT_CONFIG, mode: "words", quickEnd: true }, ["hi"]), type("hx", 0));
  assert.equal(fast.finished, true);
  let limited = run(initialState({ ...DEFAULT_CONFIG, minAcc: "custom", minAccCustom: 90 }, ["hi"]), type("hx", 0));
  limited = testReducer(limited, { type: "tick", now: 1000 });
  assert.equal(limited.result?.failReason, "minimum accuracy");
  assert.equal(limited.result?.seconds, 1);
});

test("empty unloaded targets ignore typing rather than crashing", () => {
  const s = initialState(DEFAULT_CONFIG, []);
  assert.equal(testReducer(s, { type: "char", char: "x", now: 0 }), s);
});


test("infinite time and words keep running and manually finish with actual elapsed time", () => {
  for (const config of [{ ...DEFAULT_CONFIG, time: 0 }, { ...DEFAULT_CONFIG, mode: "words" as const, words: 0 }]) {
    let s = run(initialState(config, ["hi"]), type("hi", 0));
    s = testReducer(s, { type: "tick", now: 3000 });
    assert.equal(s.finished, false);
    s = testReducer(s, { type: "finish", now: 3000 });
    assert.equal(s.result?.seconds, 3);
  }
});

test("timed custom preserves its mode and finishes on its duration", () => {
  let s = run(initialState({ ...DEFAULT_CONFIG, mode: "custom", duration: 5 }, ["hi"]), type("hi", 0));
  assert.equal(s.finished, false);
  s = testReducer(s, { type: "tick", now: 5000 });
  assert.equal(s.result?.seconds, 5);
  assert.equal(s.result?.testType[0], "custom");
});

test("lazy mode credits differently cased correct input", () => {
  const s = run(initialState({ ...DEFAULT_CONFIG, mode: "words", lazyMode: true }, ["Hi"]), type("hi", 0));
  assert.equal(s.finished, true);
  assert.equal(s.result?.acc, 100);
  assert.equal(s.result?.chars.correct, 2);
});

test("flex min burst threshold follows monkeytype's whorf formula", () => {
  assert.equal(flexBurstThreshold(50, 4), Math.floor(50 * Math.pow(1.03, -2)));
  assert.equal(flexBurstThreshold(50, 4), 47);
  assert.equal(flexBurstThreshold(50, 10), Math.min(50, Math.floor(50 * Math.pow(1.03, -14))));
  assert.equal(flexBurstThreshold(50, 2), 50);
});

test("min burst is checked when a word is committed with space, not on the last word", () => {
  const config = { ...DEFAULT_CONFIG, mode: "words" as const, words: 3, minBurst: "fixed" as const, minBurstCustomSpeed: 100 };
  // "ab" in 1s = 2 chars/1s => 24 wpm < 100
  let s = run(initialState(config, ["ab", "cd", "ef"]), [{ type: "char", char: "a", now: 0 }, { type: "char", char: "b", now: 1000 }, { type: "space", now: 1000 }]);
  assert.equal(s.finished, true);
  assert.equal(s.result?.failReason, "min burst");
  assert.deepEqual(s.result?.wordBursts, [24]);
  // slow final word finishes normally
  s = run(initialState(config, ["a", "b"]), [{ type: "char", char: "a", now: 0 }, { type: "space", now: 1 }, { type: "char", char: "b", now: 5000 }]);
  assert.equal(s.result?.failed, false);
  // flex passes a fast word
  const fast = run(initialState({ ...config, minBurst: "flex" }, ["ab", "cd", "ef"]), [{ type: "char", char: "a", now: 0 }, { type: "char", char: "b", now: 10 }, { type: "space", now: 20 }]);
  assert.equal(fast.finished, false);
});

test("an idle second does not fail min burst; min wpm waits for word index 4", () => {
  const words = ["aa", "bb", "cc", "dd", "ee", "ff"];
  const base = { ...DEFAULT_CONFIG, time: 60, minBurst: "fixed" as const, minBurstCustomSpeed: 100, minWpm: "custom" as const, minWpmCustomSpeed: 100 };
  let s = run(initialState(base, words), type("aa ", 0));
  s = testReducer(s, { type: "tick", now: 5000 });
  assert.equal(s.finished, false); // wordIndex 1: neither burst nor min wpm checked on ticks yet
  s = run(initialState({ ...base, minBurst: "off" }, words), type("aa bb cc ", 0));
  s = testReducer(s, { type: "tick", now: 5000 });
  assert.equal(s.finished, false); // activeWordIndex 3, not > 3
  s = run(s, type("dd ", 5100));
  s = testReducer(s, { type: "tick", now: 6000 });
  assert.equal(s.result?.failReason, "min speed");
});
