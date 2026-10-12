import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseQuotes,
  parseTestAmount,
  readSharedTestSettings,
  testSettingsUrl,
  validSettingsPatch,
} from "./test-settings.ts";
import { getDefaultConfig } from "./config/defaults.ts";

test("custom amounts accept whole bounded values including infinite zero", () => {
  assert.equal(parseTestAmount(" 42 "), 42);
  assert.equal(parseTestAmount("0"), 0);
  for (const text of ["", "-1", "1.2", "Infinity", "100001"])
    assert.equal(parseTestAmount(text), null);
});

test("shared test settings round trip and cannot import unrelated settings", () => {
  const config = {
    ...getDefaultConfig(),
    time: 42,
    language: "english_1k",
    punctuation: true,
  };
  const shared = readSharedTestSettings(
    new URL(testSettingsUrl("https://example.com", config)).search,
  );
  assert.equal(shared.time, 42);
  assert.equal(shared.language, "english_1k");
  assert.equal(shared.punctuation, true);
  assert.deepEqual(
    readSharedTestSettings('?customBackground="https://evil.example"'),
    {},
  );
});

test("quote boundary drops malformed records", () => {
  const quote = { text: "example", source: "author", id: 1, length: 7 };
  assert.deepEqual(
    parseQuotes({
      quotes: [null, quote, { ...quote, text: 5 }, { ...quote, id: "1" }],
    }),
    [quote],
  );
  assert.deepEqual(parseQuotes(null), []);
});

test("invalid import and shared values never replace existing settings with defaults", () => {
  assert.deepEqual(validSettingsPatch({ time: -1, language: "unknown", numbers: "true", words: 25 }), { words: 25 });
  assert.deepEqual(readSharedTestSettings('?time=-1&language="unknown"&numbers="true"&words=25'), { words: 25 });
  assert.deepEqual(validSettingsPatch(["time", 15]), {});
  assert.deepEqual(validSettingsPatch({ secret: "unknown key" }), {});
});
