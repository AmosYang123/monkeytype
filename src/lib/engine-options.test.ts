import { test } from "node:test";
import assert from "node:assert/strict";
import { parseWordList, parseLayout, parseQuotes, transformWords } from "./engine-options.ts";

test("word lists reject malformed and empty remote data", () => {
  for (const input of [null, {}, [], [""], [1], ["hello", null]]) assert.throws(() => parseWordList(input));
  assert.deepEqual(parseWordList(["hello", "world"]), ["hello", "world"]);
});

test("layouts validate every row and legend before rendering", () => {
  assert.throws(() => parseLayout({ keys: { row1: ["a"] } }));
  assert.throws(() => parseLayout({ keys: {} }));
  assert.deepEqual(parseLayout({ keys: { row1: [["a", "A"]] } }), [[["a", "A"]]]);
});

test("local funboxes compose without mutating the word list", () => {
  const words = ["hello", "world"];
  assert.deepEqual(transformWords(words, ["ALL_CAPS", "backwards"]), ["OLLEH", "DLROW"]);
  assert.deepEqual(transformWords(words, ["underscore_spaces"]), ["hello_world"]);
  assert.deepEqual(transformWords(["Hello"], ["rot13"]), ["Uryyb"]);
  assert.deepEqual(words, ["hello", "world"]);
});


test("quotes reject empty or malformed data and filter invalid entries", () => {
  assert.throws(() => parseQuotes({ quotes: [] }));
  assert.throws(() => parseQuotes({ quotes: [{ text: "" }] }));
  const quote = { id: 1, text: "hello world", source: "author", length: 11 };
  assert.deepEqual(parseQuotes({ quotes: [null, quote, { ...quote, id: null }] }), [quote]);
});
