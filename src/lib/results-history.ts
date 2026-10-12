// Local results history (localStorage "results"): feeds pace caret, personal bests and the account page.
import type { TestConfig } from "../types/test.ts";

const KEY = "results";
const MAX_RESULTS = 200;

export type ResultFilter = {
  mode: string;
  mode2: string;
  punctuation: boolean;
  numbers: boolean;
  language: string;
  difficulty: string;
  lazyMode: boolean;
};

/** optional: results saved before these fields existed lack them */
export type ResultExtra = { raw?: number; consistency?: number; seconds?: number };

export type SavedResult = ResultFilter & ResultExtra & { wpm: number; acc: number; timestamp: number };

export function filterOf(c: TestConfig): ResultFilter {
  return {
    mode: c.mode,
    mode2: c.mode === "time" ? String(c.time) : c.mode === "words" ? String(c.words) : c.mode === "quote" ? c.quoteLength : c.mode,
    punctuation: c.punctuation,
    numbers: c.numbers,
    language: c.language ?? "english",
    difficulty: c.difficulty ?? "normal",
    lazyMode: Boolean(c.lazyMode),
  };
}

const isSaved = (r: unknown): r is SavedResult => {
  if (typeof r !== "object" || r === null) return false;
  const o = r as Record<string, unknown>;
  return ["wpm", "acc", "timestamp"].every((k) => typeof o[k] === "number" && Number.isFinite(o[k]))
    && ["mode", "mode2", "language", "difficulty"].every((k) => typeof o[k] === "string")
    && ["punctuation", "numbers", "lazyMode"].every((k) => typeof o[k] === "boolean");
};

const EXTRA_KEYS = ["raw", "consistency", "seconds"] as const;

/** drops extra fields that are not finite numbers */
function withValidExtras(r: SavedResult): SavedResult {
  const out = { ...r };
  for (const k of EXTRA_KEYS) if (!(typeof out[k] === "number" && Number.isFinite(out[k]))) delete out[k];
  return out;
}

export function getResults(): SavedResult[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isSaved).map(withValidExtras) : [];
  } catch {
    return [];
  }
}

export function saveResult(config: TestConfig, wpm: number, acc: number, timestamp = Date.now(), extra: ResultExtra = {}): void {
  try {
    const next = [...getResults(), withValidExtras({ ...filterOf(config), ...extra, wpm, acc, timestamp })].slice(-MAX_RESULTS);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* storage unavailable or full */ }
}

const matching = (filter: ResultFilter, results = getResults()): SavedResult[] => {
  const keys = Object.keys(filter) as (keyof ResultFilter)[];
  return results.filter((r) => keys.every((k) => r[k] === filter[k]));
};

const roundedMean = (results: SavedResult[]): number =>
  results.length ? Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length) : 0;

/** Rounded mean wpm of the 10 newest results matching `filter`; 0 when none. */
export function getAverage10(filter: ResultFilter): number {
  return roundedMean(matching(filter).slice(-10));
}

/** Best result matching `filter` (highest wpm, earliest on ties); undefined when none. */
export function getPb(filter: ResultFilter, results = getResults()): SavedResult | undefined {
  return matching(filter, results).reduce<SavedResult | undefined>((best, r) => (!best || r.wpm > best.wpm ? r : best), undefined);
}

/** Rounded mean wpm of today's (local day) results matching `filter`; 0 when none. */
export function getDailyAverage(filter: ResultFilter, now = Date.now()): number {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return roundedMean(matching(filter).filter((r) => r.timestamp >= start.getTime() && r.timestamp <= now));
}
