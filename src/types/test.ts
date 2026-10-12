import type { Config } from "../lib/config/types.ts";

export type Mode = "time" | "words" | "quote" | "zen" | "custom";
export type QuoteLength = "all" | "short" | "medium" | "long" | "thicc";

export type TestConfig = Partial<Pick<Config, "language" | "difficulty" | "freedomMode" | "confidenceMode" | "stopOnError" | "deleteOnError" | "strictSpace" | "quickEnd" | "lazyMode" | "minWpm" | "minWpmCustomSpeed" | "minAcc" | "minAccCustom" | "minBurst" | "minBurstCustomSpeed">> & {
  mode: Mode;
  time: number;
  words: number;
  quoteLength: QuoteLength;
  punctuation: boolean;
  numbers: boolean;
  duration?: number;
};

export type LetterState = "untyped" | "correct" | "incorrect" | "extra";

export type Letter = { char: string; state: LetterState };

/** Per-second samples collected while the test runs (drive the result chart). */
export type ChartData = {
  labels: string[];
  wpm: number[];
  raw: number[];
  burst: number[];
  err: number[];
};

export type CharCounts = {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  /** correct chars inside fully-correct words, plus their spaces (drives wpm) */
  correctWordChars: number;
  /** every char typed, incl. spaces (drives raw) */
  allChars: number;
};

export type TestResult = {
  wpm: number;
  raw: number;
  acc: number;
  consistency: number;
  chars: CharCounts;
  seconds: number;
  testType: string[];
  chart: ChartData;
  failed?: boolean;
  failReason?: string;
  /** wpm of each word, from its start to its commit (Infinity when instant); one entry per typed word */
  wordBursts: number[];
  /** true when the test was started via "repeat test" */
  isRepeated?: boolean;
  /** seconds of the test with no keypress (upstream afkDuration) */
  afkDuration: number;
  /** no char/space in the last 5 seconds: upstream marks the test invalid */
  afkDetected: boolean;
};

/** one key the engine applied; word/input are the active word index and its text after the key */
export type TestEvent = {
  /** ms since the test started */
  ms: number;
  type: "char" | "space" | "backspace";
  word: number;
  input: string;
  correct: boolean;
  /** the char that was inserted (absent when stop on letter rejected it) */
  char?: string;
};

export type Quote = { text: string; source: string; length: number; id: number };
