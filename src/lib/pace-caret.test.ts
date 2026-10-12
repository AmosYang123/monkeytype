import { test } from "node:test";
import assert from "node:assert/strict";
import { commitPaceWord, initialPace, paceCaretWpm, secondsPerChar, stepPace, type PaceState } from "./pace-caret.ts";

const base = { paceCaret: "off", paceCaretCustomSpeed: 80, repeatedPace: true, averageWpm: 60, lastWpm: 45, isRepeated: false } as const;
const walk = (words: string[], s: PaceState, steps: number, blind = false) => {
  const out: [number, number][] = [];
  let cur: PaceState | null = s;
  for (let i = 0; i < steps && cur; i++) {
    cur = stepPace(words, cur, blind);
    if (cur) out.push([cur.wordIndex, cur.letterIndex]);
  }
  return out;
};

test("paceCaretWpm picks the source per mode", () => {
  assert.equal(paceCaretWpm({ ...base, paceCaret: "average" }), 60);
  assert.equal(paceCaretWpm({ ...base, paceCaret: "custom" }), 80);
  assert.equal(paceCaretWpm({ ...base, paceCaret: "last" }), 45);
  assert.equal(paceCaretWpm(base), 0);
  assert.equal(paceCaretWpm({ ...base, isRepeated: true }), 45);
  assert.equal(paceCaretWpm({ ...base, isRepeated: true, repeatedPace: false }), 0);
  assert.equal(paceCaretWpm({ ...base, paceCaret: "pb", isRepeated: true }), 0);
  assert.equal(paceCaretWpm({ ...base, paceCaret: "pb", pbWpm: 123.4 }), 123.4);
  assert.equal(paceCaretWpm({ ...base, paceCaret: "daily", dailyWpm: 70 }), 70);
  assert.equal(paceCaretWpm({ ...base, paceCaret: "daily" }), 0);
  assert.equal(paceCaretWpm({ ...base, paceCaret: "average", averageWpm: 0.4 }), 0);
  assert.equal(paceCaretWpm({ ...base, paceCaret: "average", averageWpm: NaN }), 0);
});

test("60 wpm is 5 chars a second", () => {
  assert.equal(secondsPerChar(60), 0.2);
});

test("steps walk letters then the space slot, then the next word", () => {
  assert.deepEqual(walk(["ab", "cd"], initialPace, 8), [[0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0]]); // then null: past the last word
});

test("a wrong word jumps the caret ahead by its length; fixing it pulls back", () => {
  const words = ["abc", "defg", "hij"];
  let s = commitPaceWord(initialPace, 0, 3, false, false);
  assert.equal(s.correction, 3);
  s = stepPace(words, s, false)!;
  assert.deepEqual([s.wordIndex, s.letterIndex, s.correction], [1, 0, 0]); // 1 step + 3 jump = past "abc "
  s = commitPaceWord(s, 0, 3, true, false);
  assert.equal(s.correction, -3);
  const back = stepPace(words, { ...s, wordIndex: 1, letterIndex: 0 }, false)!;
  assert.deepEqual([back.wordIndex, back.letterIndex], [0, 2]); // 1 step then 3 back, across the word boundary
});

test("blind mode ignores corrections; repeat commits are idempotent", () => {
  assert.equal(commitPaceWord(initialPace, 0, 3, false, true).correction, 0);
  const once = commitPaceWord(initialPace, 0, 3, false, false);
  assert.equal(commitPaceWord(once, 0, 3, false, false), once);
  assert.equal(commitPaceWord(initialPace, 0, 3, true, false), initialPace);
});
