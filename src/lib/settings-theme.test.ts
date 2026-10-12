import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSharedTheme, validLocalBackground } from "./settings-theme.ts";

test("shared themes round trip and reject untrusted malformed colors", () => {
  const colors = Array.from({ length: 10 }, () => "#abc");
  assert.deepEqual(
    parseSharedTheme(btoa(JSON.stringify({ c: colors }))),
    colors,
  );
  for (const value of [
    null,
    "not base64",
    btoa("null"),
    btoa(JSON.stringify({ c: ["#abc"] })),
    btoa(JSON.stringify({ c: Array(10).fill("url(javascript:1)") })),
  ])
    assert.equal(parseSharedTheme(value), null);
});

test("local background accepts raster data and rejects arbitrary stored URLs", () => {
  assert.equal(
    validLocalBackground("data:image/png;base64,YQ=="),
    "data:image/png;base64,YQ==",
  );
  for (const value of [
    null,
    "https://example.com/bg.png",
    "data:image/svg+xml;base64,YQ==",
    "javascript:alert(1)",
  ])
    assert.equal(validLocalBackground(value), "");
});
