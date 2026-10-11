export type Mode = "time" | "words" | "quote" | "zen" | "custom";
export type QuoteLength = "all" | "short" | "medium" | "long" | "thicc";

export type TestConfig = {
  mode: Mode;
  time: number;
  words: number;
  quoteLength: QuoteLength;
  punctuation: boolean;
  numbers: boolean;
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
};

export type Quote = { text: string; source: string; length: number; id: number };
