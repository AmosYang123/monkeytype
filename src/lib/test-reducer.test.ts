import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState, testReducer, type TestAction, type TestState } from "./test-reducer.ts";
import { DEFAULT_CONFIG } from "./typing.ts";

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
  const locked = run(base, [...type("ab ", 0), { type: "backspace", word: false }]);
  assert.deepEqual(locked.inputs, ["ab", ""]);
  const open = run(base, [...type("ax ", 0), { type: "backspace", word: false }]);
  assert.deepEqual(open.inputs, ["ax"]);
  const wordDel = testReducer(open, { type: "backspace", word: true });
  assert.deepEqual(wordDel.inputs, [""]);
});

test("extra letters are capped and leading spaces ignored", () => {
  let s = initialState(DEFAULT_CONFIG, ["a", "b"]);
  s = testReducer(s, { type: "space", now: 0 });
  assert.deepEqual(s.inputs, [""]);
  s = run(s, type("a".repeat(40), 0, 1));
  assert.equal(s.inputs[0].length, 21);
});
