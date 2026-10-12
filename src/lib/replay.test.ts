import { test } from "node:test";
import assert from "node:assert/strict";
import { afkStats, correctedHistory, jumpTime, missedWords, replayInputs, replayStats } from "./replay.ts";
import { initialState, testReducer, type TestAction, type TestState } from "./test-reducer.ts";
import { DEFAULT_CONFIG } from "./typing.ts";

const run = (s: TestState, actions: TestAction[]) => actions.reduce(testReducer, s);
const key = (k: string, now: number): TestAction =>
  k === "<" ? { type: "backspace", word: false, now } : k === " " ? { type: "space", now } : { type: "char", char: k, now };
const keys = (text: string, start: number, ms = 100) => [...text].map((k, i) => key(k, start + i * ms));

const words3 = () => initialState({ ...DEFAULT_CONFIG, mode: "words", words: 3 }, ["ab", "cd", "ef"]);

test("engine logs applied keys with ms from start, active word and its input", () => {
  const s = run(words3(), keys("ax<b c", 1000));
  assert.deepEqual(
    s.events.map(({ ms, type, word, input, correct }) => [ms, type, word, input, correct]),
    [[0, "char", 0, "a", true], [100, "char", 0, "ax", false], [200, "backspace", 0, "a", true], [300, "char", 0, "ab", true], [400, "space", 1, "", true], [500, "char", 1, "c", true]],
  );
});

test("replayInputs rebuilds the inputs array at any time, including stepping back a word", () => {
  const s = run(words3(), keys("ax cd<<<", 0));
  assert.deepEqual(replayInputs(s.events, 0), [""]);
  assert.deepEqual(replayInputs(s.events, 150), ["ax"]);
  assert.deepEqual(replayInputs(s.events, 450), ["ax", "cd"]);
  assert.deepEqual(replayInputs(s.events, 550), ["ax", "c"]);
  assert.deepEqual(replayInputs(s.events, Infinity), ["ax"]);
  assert.deepEqual(replayInputs(s.events, Infinity), s.inputs);
});

test("jumpTime finds the event that reaches a letter", () => {
  const s = run(words3(), keys("ab cd", 0));
  assert.equal(jumpTime(s.events, 0, 0), 0);
  assert.equal(jumpTime(s.events, 0, 1), 100);
  assert.equal(jumpTime(s.events, 1, 0), 300);
  assert.equal(jumpTime(s.events, 2, 0), Infinity);
});

test("replayStats uses the wpm of the last whole second", () => {
  assert.equal(replayStats(0, [10, 20]), "0wpm\t0s");
  assert.equal(replayStats(2, [10, 20]), "20wpm\t2s");
});

test("correctedHistory keeps the deleted char per position (upstream corrected letters)", () => {
  const fixed = run(words3(), keys("ax<b ", 0));
  assert.equal(correctedHistory(fixed.events)[0], "ax");
  // retyping the same char is not a correction
  assert.equal(correctedHistory(run(words3(), keys("ab<b ", 0)).events)[0], "ab");
  // extra letters typed then deleted make the corrected word longer than the input (extraCorrected)
  assert.equal(correctedHistory(run(words3(), keys("abc< ", 0)).events)[0], "abc");
  // deleteOnError removes the wrong char right away; it still counts as typed then deleted
  const del = run(initialState({ ...DEFAULT_CONFIG, mode: "words", words: 3, deleteOnError: "letter" }, ["ab", "cd", "ef"]), keys("axb ", 0));
  assert.equal(del.inputs[0], "ab");
  assert.equal(correctedHistory(del.events)[0], "ax");
});

test("missedWords includes words with a fixed mistake and words committed wrong", () => {
  const s = run(words3(), keys("ax<b c ef", 0));
  assert.equal(s.finished, true);
  assert.deepEqual(missedWords(s.events, s.words), ["ab", "cd"]);
});

test("afk counts seconds without a key; afk detected when the last 5 seconds have no char", () => {
  // keys at 0.0-0.4s, then a 2s pause, then keys at 2.5s
  let s = run(words3(), [...keys("ab c", 0), ...keys("d ef", 2500)]);
  assert.equal(s.finished, true);
  assert.equal(s.result?.afkDuration, 1); // second 2 (1-2s) had no key
  assert.equal(s.result?.afkDetected, false);

  s = run(initialState({ ...DEFAULT_CONFIG, time: 15 }, ["a", "b", "c"]), keys("a b", 0));
  s = testReducer(s, { type: "tick", now: 15_000 });
  assert.equal(s.result?.afkDuration, 14);
  assert.equal(s.result?.afkDetected, true);
});

test("afkStats buckets match upstream boundaries (fractional tail only when not timed)", () => {
  const ev = (ms: number, type: "char" | "backspace" = "char") => ({ ms, type, word: 0, input: "", correct: true });
  assert.deepEqual(afkStats([ev(0), ev(2600)], 2600, false), { afkDuration: 1, afkDetected: false });
  assert.deepEqual(afkStats([ev(0), ev(2600)], 2600, true), { afkDuration: 1, afkDetected: false });
  // backspace counts as activity, not as typing
  assert.deepEqual(afkStats([ev(0), ev(1500, "backspace")], 2000, true), { afkDuration: 0, afkDetected: false });
  assert.deepEqual(afkStats([ev(500, "backspace"), ev(1500, "backspace")], 2000, true), { afkDuration: 0, afkDetected: true });
});
