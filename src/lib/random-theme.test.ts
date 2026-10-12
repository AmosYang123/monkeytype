import assert from "node:assert/strict";
import { test } from "node:test";
import { isLightColor, nextRandomTheme, themePool } from "./random-theme.ts";

const bgs: Record<string, string> = { a: "#ffffff", b: "#000000", c: "#eee", d: "#111111" };
const base = { names: ["a", "b", "c", "d"], favs: ["b"], bgOf: (n: string) => bgs[n] };
const rng = () => 0;

test("isLightColor uses hsl lightness >= 50", () => {
  assert.equal(isLightColor("#ffffff"), true);
  assert.equal(isLightColor("#000"), false);
  assert.equal(isLightColor("#808080"), true);
});

test("themePool per mode", () => {
  assert.deepEqual(themePool({ ...base, mode: "light" }), ["a", "c"]);
  assert.deepEqual(themePool({ ...base, mode: "dark" }), ["b", "d"]);
  assert.deepEqual(themePool({ ...base, mode: "fav" }), ["b"]);
  assert.deepEqual(themePool({ ...base, mode: "on" }), ["a", "b", "c", "d"]);
  assert.deepEqual(themePool({ ...base, mode: "custom" }), []);
});

test("nextRandomTheme cycles through every theme once", () => {
  const state = { list: [], index: 0 };
  const seen = [1, 2, 3, 4].map(() => nextRandomTheme(state, { ...base, mode: "on", prefersDark: true, rng }));
  assert.deepEqual(new Set(seen.map((s) => s?.name)), new Set(["a", "b", "c", "d"]));
  assert.deepEqual(
    seen.map((s) => s?.wrapped),
    [false, false, false, true],
  );
});

test("auto mode follows the system scheme", () => {
  const state = { list: [], index: 0 };
  for (let i = 0; i < 6; i++) {
    const r = nextRandomTheme(state, { ...base, mode: "auto", prefersDark: false, rng });
    assert.ok(r && ["a", "c"].includes(r.name));
  }
});

test("empty pool returns null", () => {
  assert.equal(nextRandomTheme({ list: [], index: 0 }, { ...base, mode: "custom", prefersDark: true, rng }), null);
});
