// Local results history (localStorage "results"): feeds the pace-caret average.
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

export type SavedResult = ResultFilter & { wpm: number; acc: number; timestamp: number };

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

export function getResults(): SavedResult[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isSaved) : [];
  } catch {
    return [];
  }
}

export function saveResult(config: TestConfig, wpm: number, acc: number, timestamp = Date.now()): void {
  try {
    const next = [...getResults(), { ...filterOf(config), wpm, acc, timestamp }].slice(-MAX_RESULTS);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* storage unavailable or full */ }
}

/** Rounded mean wpm of the 10 newest results matching `filter`; 0 when none. */
export function getAverage10(filter: ResultFilter): number {
  const keys = Object.keys(filter) as (keyof ResultFilter)[];
  const recent = getResults().filter((r) => keys.every((k) => r[k] === filter[k])).slice(-10);
  return recent.length ? Math.round(recent.reduce((sum, r) => sum + r.wpm, 0) / recent.length) : 0;
}
