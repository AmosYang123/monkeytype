import assert from "node:assert/strict";
import { test } from "node:test";
import { checkCompatibility } from "./funbox-validation.ts";

test("no active funboxes is always compatible", () => {
  assert.equal(checkCompatibility([], "mirror"), true);
});

test("unknown funbox is rejected", () => {
  assert.equal(checkCompatibility(["nope"]), false);
  assert.equal(checkCompatibility([], "nope"), false);
});

test("two word modifiers conflict", () => {
  assert.equal(checkCompatibility(["58008"], "binary"), false);
});

test("two css modifications of the same element conflict", () => {
  assert.equal(checkCompatibility(["mirror"], "upside_down"), false);
});

test("a visual funbox combines with a word-generating one", () => {
  assert.equal(checkCompatibility(["mirror"], "gibberish"), true);
});
