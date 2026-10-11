import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_CONFIG, getDefaultConfig } from "./defaults.ts";
import { ENUM_OPTIONS, FUNBOX_OPTIONS, NUMBER_RANGES, sanitizeConfig } from "./options.ts";
import { FONTS, FUNBOXES, LANGUAGES, LANGUAGE_GROUPS, LAYOUTS, THEME_NAMES } from "./lists.ts";
import type { ConfigKey } from "./types.ts";

const keys = Object.keys(DEFAULT_CONFIG) as ConfigKey[];

test("getDefaultConfig returns an independent copy", () => {
  const a = getDefaultConfig();
  a.favThemes.push("dark");
  a.customThemeColors[0] = "#000000";
  assert.deepEqual(DEFAULT_CONFIG.favThemes, []);
  assert.equal(DEFAULT_CONFIG.customThemeColors[0], "#323437");
});

test("sanitizeConfig returns defaults for garbage input and never throws", () => {
  for (const garbage of [null, undefined, 5, "x", true, [], [1, 2], () => 1, { a: 1 }, JSON.parse('{"__proto__":{"x":1}}')]) {
    assert.deepEqual(sanitizeConfig(garbage), DEFAULT_CONFIG);
  }
  assert.equal(({} as Record<string, unknown>).x, undefined);
});

test("sanitizeConfig keeps valid keys, falls back on invalid ones and drops unknown keys", () => {
  const out = sanitizeConfig({
    difficulty: "master",
    time: 60,
    words: 12.5, // not an integer
    fontSize: 0, // must be > 0
    tapeMargin: 95, // above max
    soundVolume: 0.3,
    punctuation: "yes", // wrong type
    language: "german",
    layout: "not_a_layout",
    theme: "dracula",
    funbox: ["mirror", "nope"],
    customPolyglot: ["english"], // needs at least 2
    maxLineWidth: 0,
    customBackground: "javascript:alert(1)",
    notAKey: 1,
  });
  assert.equal(out.difficulty, "master");
  assert.equal(out.time, 60);
  assert.equal(out.words, DEFAULT_CONFIG.words);
  assert.equal(out.fontSize, DEFAULT_CONFIG.fontSize);
  assert.equal(out.tapeMargin, DEFAULT_CONFIG.tapeMargin);
  assert.equal(out.soundVolume, 0.3);
  assert.equal(out.punctuation, false);
  assert.equal(out.language, "german");
  assert.equal(out.layout, "default");
  assert.equal(out.theme, "dracula");
  assert.deepEqual(out.funbox, []);
  assert.deepEqual(out.customPolyglot, DEFAULT_CONFIG.customPolyglot);
  assert.equal(out.maxLineWidth, 0);
  assert.equal(out.customBackground, "");
  assert.equal("notAKey" in out, false);
  assert.deepEqual(Object.keys(out).sort(), [...keys].sort());
});

test("sanitizeConfig accepts a fully valid config unchanged", () => {
  const valid = {
    ...getDefaultConfig(),
    mode: "words",
    quoteLength: [0, 2],
    funbox: ["mirror", "nausea"],
    maxLineWidth: 100,
    keymapLayout: "dvorak",
    fontFamily: "My-Font.2",
    customBackground: "https://example.com/bg.png",
    accountChart: ["on", "off", "on", "off"],
    customBackgroundFilter: [1, 2, 3, 4],
  };
  assert.deepEqual(sanitizeConfig(JSON.parse(JSON.stringify(valid))), valid);
});

test("every enum-like default is one of its allowed options", () => {
  for (const key of keys) {
    const options = ENUM_OPTIONS[key] as readonly unknown[] | undefined;
    if (options) assert.ok(options.includes(DEFAULT_CONFIG[key]), `${key} default not in options`);
  }
  for (const key of Object.keys(NUMBER_RANGES) as ConfigKey[]) {
    assert.equal(typeof DEFAULT_CONFIG[key], "number", key);
  }
});

test("default language, layout, theme, font and funbox values exist in the lists", () => {
  assert.ok(LANGUAGES.includes(DEFAULT_CONFIG.language));
  for (const l of DEFAULT_CONFIG.customLayoutfluid) assert.ok(LAYOUTS.includes(l), l);
  for (const l of DEFAULT_CONFIG.customPolyglot) assert.ok(LANGUAGES.includes(l), l);
  assert.ok(THEME_NAMES.includes(DEFAULT_CONFIG.theme));
  assert.ok(THEME_NAMES.includes(DEFAULT_CONFIG.themeLight));
  assert.ok(THEME_NAMES.includes(DEFAULT_CONFIG.themeDark));
  assert.ok(FONTS.some((f) => f.name === DEFAULT_CONFIG.fontFamily));
});

test("list data is consistent", () => {
  assert.equal(new Set(LANGUAGES).size, LANGUAGES.length);
  assert.equal(Object.values(LANGUAGE_GROUPS).flat().length, LANGUAGES.length);
  assert.equal(new Set(THEME_NAMES).size, THEME_NAMES.length);
  assert.equal(new Set(LAYOUTS).size, LAYOUTS.length);
  assert.deepEqual(FUNBOXES.map((f) => f.name), [...FUNBOX_OPTIONS]);
});

test("every SettingMeta config key in metadata.tsx is a real config key", () => {
  // metadata.tsx has JSX, which node:test can't load, so scan its source instead
  const source = readFileSync(new URL("./metadata.tsx", import.meta.url), "utf8");
  const used = [
    ...[...source.matchAll(/^\s*setting\(\s*"(\w+)"/gm)].map((m) => m[1]),
    ...[...source.matchAll(/(?:configKey|inputKey|key): "(\w+)"/g)].map((m) => m[1]),
    ...[...source.matchAll(/withInput\(\w+, "(\w+)"/g)].map((m) => m[1]),
  ];
  assert.ok(used.length > 70, `only found ${used.length} keys`);
  for (const key of used) assert.ok(key in DEFAULT_CONFIG, `${key} is not a config key`);
});
