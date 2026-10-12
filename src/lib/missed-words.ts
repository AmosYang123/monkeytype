// All-time missed-words bank (localStorage "missedWords"): word -> times missed, across saved tests.
const KEY = "missedWords";
const MAX_WORDS = 500;

export function getMissedBank(): Record<string, number> {
  try {
    const o: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (typeof o !== "object" || o === null || Array.isArray(o)) return {};
    return Object.fromEntries(Object.entries(o).filter((e): e is [string, number] => typeof e[1] === "number" && Number.isFinite(e[1]) && e[1] > 0));
  } catch {
    return {};
  }
}

/** Adds one miss per word; keeps the MAX_WORDS most-missed (ties: newest kept). */
export function addMissedWords(words: readonly string[]): void {
  if (!words.length) return;
  const bank = getMissedBank();
  for (const word of new Set(words)) {
    const count = (bank[word] ?? 0) + 1;
    delete bank[word]; // re-insert so it counts as newest
    bank[word] = count;
  }
  const entries = Object.entries(bank);
  const kept = entries.length > MAX_WORDS
    ? entries.map((e, i) => [e, i] as const).sort((a, b) => b[0][1] - a[0][1] || b[1] - a[1]).slice(0, MAX_WORDS).sort((a, b) => a[1] - b[1]).map(([e]) => e)
    : entries;
  try {
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(kept)));
  } catch {
    // storage unavailable or full
  }
}

/** Most-missed words first. */
export function mostMissed(limit = 50): string[] {
  return Object.entries(getMissedBank()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word]) => word);
}
