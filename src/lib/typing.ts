// Pure typing-test logic. No React, no DOM: keep it testable with `node --test`.
import type { CharCounts, Letter, QuoteLength, TestConfig } from "../types/test.ts";

export const DEFAULT_CONFIG: TestConfig = {
  mode: "time",
  time: 30,
  words: 50,
  quoteLength: "medium",
  punctuation: false,
  numbers: false,
};

export const MODE_OPTIONS = {
  time: [15, 30, 60, 120],
  words: [10, 25, 50, 100],
  quote: ["all", "short", "medium", "long", "thicc"] as QuoteLength[],
};

/** Quote length groups (char counts) from monkeytype's quotes/english.json. */
export const QUOTE_GROUPS: Record<Exclude<QuoteLength, "all">, [number, number]> = {
  short: [0, 100],
  medium: [101, 300],
  long: [301, 600],
  thicc: [601, 9999],
};

export const CUSTOM_TEXT = "The quick brown fox jumps over the lazy dog";

type Rng = () => number;

const pick = <T,>(arr: readonly T[], rng: Rng): T => arr[Math.floor(rng() * arr.length)];

const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** Mimics monkeytype's punctuation mode: sentence casing plus random marks. */
function punctuate(words: string[], rng: Rng): string[] {
  const out: string[] = [];
  let sentenceStart = true;
  for (let i = 0; i < words.length; i++) {
    let w = words[i];
    if (sentenceStart) w = capitalize(w);
    sentenceStart = false;
    const isLast = i === words.length - 1;
    const r = rng();
    if (isLast || r < 0.1) {
      w += pick([".", ".", ".", "?", "!"], rng);
      sentenceStart = true;
    } else if (r < 0.2) w += ",";
    else if (r < 0.23) w += pick([";", ":"], rng);
    else if (r < 0.26) w = `"${w}"`;
    else if (r < 0.28) w = `(${w})`;
    else if (r < 0.3) out.push("-");
    out.push(w);
  }
  return out;
}

export function generateWords(
  config: TestConfig,
  wordlist: readonly string[],
  count: number,
  rng: Rng = Math.random,
): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    let w = pick(wordlist, rng);
    // never the same word twice in a row
    while (words.length && w === words[words.length - 1] && wordlist.length > 1) w = pick(wordlist, rng);
    if (config.numbers && rng() < 0.1) w = String(Math.floor(rng() * 10 ** (1 + Math.floor(rng() * 3))));
    words.push(w);
  }
  return config.punctuation ? punctuate(words, rng) : words;
}

/** Splits a typed word against its target into per-letter states (extras appended). */
export function letterStates(target: string, typed: string | undefined): Letter[] {
  const letters: Letter[] = [...target].map((char, i) => {
    if (typed === undefined || i >= typed.length) return { char, state: "untyped" };
    return { char, state: typed[i] === char ? "correct" : "incorrect" };
  });
  if (typed) for (const char of typed.slice(target.length)) letters.push({ char, state: "extra" });
  return letters;
}

export const isWordError = (target: string, typed: string) => typed !== target;

/**
 * Character counts the way monkeytype reports them.
 * `inputs` holds every committed word plus the in-progress one last.
 */
export function countChars(targets: readonly string[], inputs: readonly string[], finished: boolean): CharCounts {
  const c: CharCounts = { correct: 0, incorrect: 0, extra: 0, missed: 0, correctWordChars: 0, allChars: 0 };
  inputs.forEach((typed, i) => {
    const target = targets[i] ?? "";
    const isLast = i === inputs.length - 1;
    const committed = !isLast || finished;
    for (let j = 0; j < Math.max(target.length, typed.length); j++) {
      if (j >= typed.length) {
        if (committed && !isLast) c.missed++;
      } else if (j >= target.length) c.extra++;
      else if (typed[j] === target[j]) c.correct++;
      else c.incorrect++;
    }
    c.allChars += typed.length + (isLast ? 0 : 1);
    const wordCorrect = isLast ? target.startsWith(typed) && typed.length > 0 : typed === target;
    if (wordCorrect) c.correctWordChars += typed.length + (isLast ? 0 : 1);
    if (!isLast) c.correct += typed === target ? 1 : 0; // the space after a correct word
  });
  return c;
}

export const wpmFrom = (chars: number, seconds: number) => (seconds > 0 ? (chars / 5) * (60 / seconds) : 0);

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const stdDev = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

/** monkeytype's consistency: 100 * (1 - tanh(cv + cv^3/3 + cv^5/5)) over per-second raw wpm. */
export function consistency(rawPerSecond: number[]): number {
  if (rawPerSecond.length === 0) return 0;
  const m = mean(rawPerSecond);
  if (m === 0) return 0;
  const cv = stdDev(rawPerSecond) / m;
  return 100 * (1 - Math.tanh(cv + cv ** 3 / 3 + cv ** 5 / 5));
}

export const accuracy = (correctKeys: number, totalKeys: number) =>
  totalKeys === 0 ? 0 : (correctKeys / totalKeys) * 100;
