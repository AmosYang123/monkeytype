import { test } from "node:test";
import assert from "node:assert/strict";
import { __resetStoreForTests, getConfig, resetConfig, setConfig, setConfigs, subscribeConfig } from "./store.ts";
import type { ConfigKey } from "./types.ts";

test("setConfig updates, notifies changed keys, ignores no-ops and invalid values", () => {
  __resetStoreForTests();
  const seen: (readonly ConfigKey[])[] = [];
  subscribeConfig((c) => seen.push(c));

  assert.equal(setConfig("difficulty", "expert"), true);
  assert.equal(getConfig().difficulty, "expert");
  assert.equal(setConfig("difficulty", "expert"), false);
  setConfigs({ mode: "words", words: 25 });
  assert.deepEqual(seen, [["difficulty"], ["mode", "words"]]);

  // invalid value is rejected by sanitizeConfig (falls back to default, which equals current → no change)
  setConfigs({ fontSize: -5 } as never);
  assert.ok(getConfig().fontSize > 0);
});

test("resetConfig restores defaults and reports what changed", () => {
  __resetStoreForTests();
  setConfig("blindMode", true);
  let changed: readonly ConfigKey[] = [];
  subscribeConfig((c) => (changed = c));
  resetConfig();
  assert.equal(getConfig().blindMode, false);
  assert.deepEqual(changed, ["blindMode"]);
});
