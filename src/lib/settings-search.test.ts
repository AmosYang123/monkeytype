import assert from "node:assert/strict";
import { test } from "node:test";
import { matchingIndexes, queryTokens, textOf } from "./settings-search.ts";

test("queryTokens splits and lowercases", () => {
  assert.deepEqual(queryTokens("  Min  SPEED "), ["min", "speed"]);
  assert.deepEqual(queryTokens("   "), []);
});

test("empty query matches everything", () => {
  assert.equal(matchingIndexes(["a", "b"], "").size, 2);
});

test("only the best-scoring settings match", () => {
  const hay = ["min speed fails a test", "speed unit", "caret style"];
  assert.deepEqual([...matchingIndexes(hay, "min speed")], [0]);
  assert.deepEqual([...matchingIndexes(hay, "speed")], [0, 1]);
  assert.equal(matchingIndexes(hay, "zzz").size, 0);
});

test("textOf flattens strings and arrays", () => {
  assert.equal(textOf(["a", 1, null]).trim(), "a 1");
});
