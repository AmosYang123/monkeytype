import { test } from "node:test";
import assert from "node:assert/strict";
import { caretDuration } from "./caret-motion.ts";

test("smoothCaret durations match monkeytype", () => {
  assert.deepEqual((["off", "slow", "medium", "fast"] as const).map(caretDuration), [0, 150, 100, 85]);
});
