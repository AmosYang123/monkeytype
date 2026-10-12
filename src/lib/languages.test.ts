import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { LANGUAGES } from "./config/lists.ts";
import { languageUrl, loadLanguage } from "./languages.ts";
import { parseWordList } from "./engine-options.ts";

test("every selectable language has a valid bundled dictionary", async () => {
  for (const name of LANGUAGES) {
    const data: unknown = JSON.parse(await readFile(new URL(`../../public/languages/${encodeURIComponent(name)}.json`, import.meta.url), "utf8"));
    assert.ok(typeof data === "object" && data !== null && "words" in data, name);
    assert.ok(parseWordList(data.words).length > 0, name);
    assert.equal(languageUrl(name), `/languages/${encodeURIComponent(name)}.json`);
  }
});

test("language requests use local files, share successful loads and retry failures", async () => {
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    return urls.length === 1 ? new Response("unavailable", { status: 503 }) : Response.json({ words: ["hello", "world"] });
  };
  try {
    await assert.rejects(loadLanguage("english_450k"), /HTTP 503/);
    const data = await loadLanguage("english_450k");
    assert.deepEqual(data.words, ["hello", "world"]);
    assert.strictEqual(await loadLanguage("english_450k"), data);
    assert.deepEqual(urls, ["/languages/english_450k.json", "/languages/english_450k.json"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
