import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SELECTION,
  nextUpdateText,
  pageFromParams,
  paramsFor,
  selectionFromParams,
  speedEntries,
  titleText,
  xpEntries,
} from "./data.ts";

const NOW = Date.UTC(2026, 9, 11, 15, 26, 39);

test("all-time mock data is deterministic and well-formed", () => {
  const a = speedEntries(DEFAULT_SELECTION, NOW);
  const b = speedEntries({ ...DEFAULT_SELECTION }, NOW + 1000);
  assert.equal(a.length, 1000);
  assert.deepEqual(a.slice(0, 3), b.slice(0, 3));
  for (let i = 0; i < a.length; i++) {
    const e = a[i];
    if (i > 0) assert.ok(a[i - 1].wpm >= e.wpm);
    assert.ok(e.acc >= 92 && e.acc <= 100);
    assert.ok(e.raw >= e.wpm);
    assert.ok(e.consistency >= 70 && e.consistency <= 95);
  }
  assert.equal(new Set(a.map((e) => e.name)).size, a.length);
});

test("weekly xp is descending", () => {
  const x = xpEntries({ ...DEFAULT_SELECTION, type: "weekly" }, NOW);
  assert.ok(x[0].totalXp > x[1].totalXp);
  assert.ok(x[0].totalXp > 400_000);
});

test("url params round-trip", () => {
  const qs = paramsFor({ ...DEFAULT_SELECTION, type: "daily", language: "german", mode2: "60" }, 2);
  assert.equal(qs, "type=daily&mode=time&mode2=60&language=german&page=3");
  const p = new URLSearchParams(qs);
  assert.deepEqual(selectionFromParams(p), { type: "daily", mode2: "60", language: "german", previous: false });
  assert.equal(pageFromParams(p), 2);
  assert.equal(pageFromParams(new URLSearchParams("page=zzz")), 0);
});

test("countdown and title text", () => {
  assert.equal(nextUpdateText("daily", NOW), "Next reset in: 08:33:21");
  assert.match(nextUpdateText("allTime", NOW), /^Next update in: (0\d|1[0-5]):\d\d$/);
  assert.equal(nextUpdateText("weekly", NOW), "Next reset in: 08:33:21");
  assert.equal(titleText(DEFAULT_SELECTION), "All-time English  Time 15 Leaderboard");
});
