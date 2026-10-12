import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCommands, singleListEntries } from "./commandline-commands.ts";
import { findMatchingCommands } from "./commandline-search.ts";
import { getDefaultConfig } from "./config/defaults.ts";

const config = getDefaultConfig();
const entries = singleListEntries(buildCommands(config));
const search = (input: string) => {
  const found = findMatchingCommands(entries, input);
  return entries.filter((_, i) => found[i]);
};
const rows = (input: string) => search(input).map((entry) => (entry.parent ? `${entry.parent} > ${entry.child?.display}` : entry.display));

test("pace returns only the pace caret rows, in upstream order", () => {
  assert.deepEqual(rows("pace"), [
    ...["off", "pb", "tag pb", "last", "average", "daily", "custom..."].map((name) => `Pace caret mode > ${name}`),
    "Repeated pace > off",
    "Repeated pace > on",
    ...["off", "default", "block", "outline", "underline", "carrot", "banana", "monkey"].map((name) => `Pace caret style > ${name}`),
  ]);
});

test("sound rows use the upstream names", () => {
  const sound = rows("sound");
  assert.ok(sound.includes("Sound on click > nk creams"));
  assert.ok(sound.includes("Sound on error > punch miss"));
  assert.ok(sound.includes("Play time warning > 3 seconds"));
  assert.ok(sound.includes("Play time warning > 1 second"));
  assert.ok(!sound.some((row) => row.includes("missed punch") || row.startsWith("Play sound")));
  assert.deepEqual(rows("sound volume"), ["Sound volume > quiet", "Sound volume > medium", "Sound volume > loud", "Sound volume > custom..."]);
});

test("caret style offers every style", () => {
  assert.deepEqual(
    rows("caret style").filter((row) => row.startsWith("Caret style")),
    ["off", "default", "block", "outline", "underline", "carrot", "banana", "monkey"].map((name) => `Caret style > ${name}`),
  );
});

test("themes are sorted by name and favorites come first", () => {
  const names = (c = config) => buildCommands(c).find((top) => top.id === "theme")?.children?.map((child) => child.display) ?? [];
  assert.deepEqual(names().slice(0, 3), ["8008", "80s after dark", "9009"]);
  assert.equal(names({ ...config, favThemes: ["nord"] })[0], "nord");
});

test("theme commands", () => {
  const theme = rows("theme");
  assert.ok(theme.includes("Custom theme > off") && theme.includes("Custom theme > on"));
  assert.ok(theme.includes("Add current theme to favorite"));
  assert.ok(!theme.some((row) => row.startsWith("Auto switch")));
  const faved = singleListEntries(buildCommands({ ...config, favThemes: [config.theme] })).map((entry) => entry.display);
  assert.ok(faved.includes("Remove current theme from favorite") && !faved.includes("Add current theme to favorite"));
});

test("a row applies its option to the config key, time and words also switch the mode", () => {
  const find = (parent: string, display: string) => entries.find((entry) => entry.parent === parent && entry.child?.display === display)?.child;
  assert.deepEqual(find("Smooth caret", "fast")?.patch, { smoothCaret: "fast" });
  assert.deepEqual(find("Word count", "25")?.patch, { words: 25, mode: "words" });
  assert.equal(find("Smooth caret", "medium")?.active, true);
  assert.deepEqual(find("Minimum speed", "custom...")?.input?.apply("120"), { minWpm: "custom", minWpmCustomSpeed: 120 });
  assert.equal(find("Sound volume", "custom...")?.input?.apply("abc"), null);
});
