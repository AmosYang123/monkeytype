// Derived stats for the local account page, from the saved results history (oldest first).
import type { SavedResult } from "./results-history.ts";

export const PB_SLOTS = [
  { mode: "time", mode2: ["15", "30", "60", "120"] },
  { mode: "words", mode2: ["10", "25", "50", "100"] },
] as const;

/** Best wpm per mode/mode2 slot across languages and punctuation; undefined slots have no result. */
export function personalBests(results: readonly SavedResult[]): Record<string, SavedResult | undefined> {
  const out: Record<string, SavedResult | undefined> = {};
  for (const { mode, mode2 } of PB_SLOTS) {
    for (const m2 of mode2) {
      out[`${mode} ${m2}`] = results.filter((r) => r.mode === mode && r.mode2 === m2).reduce<SavedResult | undefined>((best, r) => (!best || r.wpm > best.wpm ? r : best), undefined);
    }
  }
  return out;
}

/** Seconds typed: the saved duration, or the time-mode length for results saved before durations were kept. */
export const resultSeconds = (r: SavedResult): number => r.seconds ?? (r.mode === "time" ? Number(r.mode2) || 0 : 0);

const mean = (xs: readonly number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function totals(results: readonly SavedResult[]) {
  return {
    tests: results.length,
    seconds: results.reduce((sum, r) => sum + resultSeconds(r), 0),
    avgWpm: mean(results.map((r) => r.wpm)),
    avgAcc: mean(results.map((r) => r.acc)),
    last10Wpm: mean(results.slice(-10).map((r) => r.wpm)),
    best: results.reduce((best, r) => Math.max(best, r.wpm), 0),
  };
}

/** Mean of each value and up to `window - 1` values before it. */
export function rollingAverage(values: readonly number[], window = 10): number[] {
  return values.map((_, i) => mean(values.slice(Math.max(0, i - window + 1), i + 1)));
}

/** "1h 02m 03s" style duration */
export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}h ${pad(m)}m ${pad(s % 60)}s` : m ? `${m}m ${pad(s % 60)}s` : `${s}s`;
}

/** "time 30 · english · punctuation" */
export function describeResult(r: SavedResult): string {
  const head = r.mode === r.mode2 ? r.mode : `${r.mode} ${r.mode2}`;
  return [head, r.language.replaceAll("_", " "), ...(r.punctuation ? ["punctuation"] : []), ...(r.numbers ? ["numbers"] : [])].join(" · ");
}

const CSV_COLUMNS = ["timestamp", "mode", "mode2", "language", "punctuation", "numbers", "difficulty", "lazyMode", "wpm", "raw", "acc", "consistency", "seconds"] as const;

export function resultsCsv(results: readonly SavedResult[]): string {
  const rows = results.map((r) => CSV_COLUMNS.map((k) => {
    const v = r[k];
    if (k === "timestamp") return new Date(r.timestamp).toISOString();
    return v === undefined ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v);
  }).join(","));
  return [CSV_COLUMNS.join(","), ...rows].join("\n");
}
