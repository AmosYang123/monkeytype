import { test } from "node:test";
import assert from "node:assert/strict";
import { adjacentRuns, joinOverlappingHints, type Hint, type LetterBox } from "./typo-hints.ts";

// 10px-wide letters on one line; hints are 8px per char (0.75em of the letter)
const letters: LetterBox[] = Array.from({ length: 6 }, (_, i) => ({ left: i * 10, top: 0, width: 10 }));
const hintAt = (i: number, text: string): Hint => ({ indices: [i], text, left: letters[i].left + 5 });
const width = (text: string) => [...text].length * 8 + 2;

test("adjacentRuns groups consecutive indices", () => {
  assert.deepEqual(adjacentRuns([1, 2, 3, 5, 7, 8]), [[1, 2, 3], [5], [7, 8]]);
  assert.deepEqual(adjacentRuns([]), []);
});

test("adjacent overlapping hints merge and re-centre over their letters", () => {
  // 10px apart with 10px-wide hints -> overlap
  const merged = joinOverlappingHints([hintAt(1, "x"), hintAt(2, "y"), hintAt(3, "z")], letters, (text) => [...text].length * 10 + 2);
  assert.deepEqual(merged, [{ indices: [1, 2, 3], text: "xyz", left: 25 }]);
});

test("non-overlapping or non-adjacent hints stay separate", () => {
  assert.equal(joinOverlappingHints([hintAt(1, "x"), hintAt(2, "y")], letters, width).length, 2);
  assert.equal(joinOverlappingHints([hintAt(1, "x"), hintAt(3, "y")], letters, () => 100).length, 2);
});

test("hints on different lines never merge", () => {
  const wrapped = letters.map((box, i) => (i >= 2 ? { ...box, top: 20 } : box));
  assert.equal(joinOverlappingHints([hintAt(1, "x"), hintAt(2, "y")], wrapped, () => 100).length, 2);
});
