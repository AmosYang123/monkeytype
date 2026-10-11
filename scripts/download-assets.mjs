// Downloads every binary asset the clone needs from monkeytype.com into public/.
// Run: node scripts/download-assets.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const BASE = "https://monkeytype.com";
const ASSETS = {
  "webfonts/RobotoMono-Regular.woff2": "/webfonts/RobotoMono-Regular.woff2",
  "webfonts/LexendDeca-Regular.woff2": "/webfonts/LexendDeca-Regular.woff2",
  "webfonts/fa-solid-900.woff2": "/webfonts/fa-solid-900-COjqfJMd.woff2",
  "webfonts/fa-regular-400.woff2": "/webfonts/fa-regular-400-CPEIu2bx.woff2",
  "webfonts/fa-brands-400.woff2": "/webfonts/fa-brands-400-BJEvs-YL.woff2",
  "images/merch2.png": "/images/merch2.png",
  "seo/favicon.ico": "/images/favicon/favicon.ico",
  "seo/apple-touch-icon.png": "/images/favicon/apple-touch-icon.png",
  "seo/safari-pinned-tab.svg": "/images/favicon/safari-pinned-tab.svg",
  "seo/mtsocial.png": "/images/mtsocial.png",
  "data/english.json": "/languages/english.json",
  "data/quotes-english.json": "/quotes/english.json",
};

async function download([dest, src]) {
  const res = await fetch(BASE + src);
  if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
  const out = join("public", dest);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  return out;
}

const entries = Object.entries(ASSETS);
let failed = 0;
for (let i = 0; i < entries.length; i += 4) {
  const results = await Promise.allSettled(entries.slice(i, i + 4).map(download));
  for (const r of results) {
    if (r.status === "fulfilled") console.log("ok  ", r.value);
    else {
      failed++;
      console.error("FAIL", r.reason.message);
    }
  }
}
process.exit(failed ? 1 : 0);
