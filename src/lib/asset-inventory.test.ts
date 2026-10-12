import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { LAYOUTS } from "./config/lists.ts";
import { parseLayout, parseQuotes } from "./engine-options.ts";

const publicUrl = new URL("../../public/", import.meta.url);

test("every selectable keyboard layout is bundled and parseable", async () => {
  for (const name of LAYOUTS.filter((name) => name !== "default" && name !== "overrideSync")) {
    const data: unknown = JSON.parse(await readFile(new URL(`layouts/${encodeURIComponent(name)}.json`, publicUrl), "utf8"));
    assert.ok(parseLayout(data).length > 0, name);
  }
});

test("every bundled quote collection is parseable", async () => {
  for (const name of (await readdir(new URL("quotes/", publicUrl))).filter((name) => name.endsWith(".json"))) {
    const data: unknown = JSON.parse(await readFile(new URL(`quotes/${encodeURIComponent(name)}`, publicUrl), "utf8"));
    assert.ok(parseQuotes(data).length > 0, name);
  }
});

test("footer policy links have bundled documents", async () => {
  for (const name of ["terms-of-service.html", "security-policy.html", "privacy-policy.html"]) {
    await access(new URL(name, publicUrl));
  }
});
