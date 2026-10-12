import assert from "node:assert/strict";
import { test } from "node:test";
import { findMatchingCommands, parseSearch, stripEllipsis } from "./commandline-search.ts";

const names = (displays: string[], input: string) => {
  const found = findMatchingCommands(displays.map((display) => ({ display })), input);
  return displays.filter((_, i) => found[i]);
};

test("stripEllipsis removes the trailing dots only", () => {
  assert.equal(stripEllipsis("Theme..."), "Theme");
  assert.equal(stripEllipsis("Quote length ..."), "Quote length");
  assert.equal(stripEllipsis("Theme"), "Theme");
});

test("words only match at the start of a word", () => {
  const all = ["Pace caret mode off", "Space balls", "Cyberspace", "Backspace", "Repeated pace on"];
  assert.deepEqual(names(all, "pace"), ["Pace caret mode off", "Repeated pace on"]);
});

test("an empty query matches everything and a leading > is ignored", () => {
  const all = ["Theme dark", "Language english"];
  assert.deepEqual(names(all, ""), all);
  assert.deepEqual(names(all, ">theme"), ["Theme dark"]);
});

test("every word must match a different word, strongest match wins", () => {
  const all = ["Theme dark", "Theme light", "Dark mode", "Language english"];
  assert.deepEqual(names(all, "theme dark"), ["Theme dark"]);
  assert.deepEqual(names(all, "dar the"), ["Theme dark"]);
});

test("aliases are searched too, punctuation is ignored", () => {
  const found = findMatchingCommands([{ display: "Minimum speed custom...", alias: "wpm" }, { display: "Other" }], "wpm");
  assert.deepEqual(found, [true, false]);
  assert.deepEqual(findMatchingCommands([{ display: "custom..." }], "custom"), [true]);
});

test("parseSearch switches to single list on > prefix", () => {
  assert.deepEqual(parseSearch(">dark", "manual"), { single: true, query: "dark" });
  assert.deepEqual(parseSearch("dark", "manual"), { single: false, query: "dark" });
  assert.deepEqual(parseSearch("dark", "on"), { single: true, query: "dark" });
});
