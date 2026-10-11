// Cross-feature contracts between the test engine and features built around it
// (random theme, practise words, quote search). Window events keep them decoupled.

/** Fired by the engine when a test ends (passed or failed). */
export const TEST_FINISHED_EVENT = "mt:test-finished";
/** Fired by the engine when the first key of a test is pressed. */
export const TEST_STARTED_EVENT = "mt:test-started";
/** Fired by the practise-words modal; the engine starts a practice test. */
export const PRACTISE_WORDS_EVENT = "mt:practise-words";

export type TestFinishedDetail = { failed: boolean; failReason?: string };
export type PractiseWordsDetail = { missed: "off" | "words" | "biwords"; slow: boolean };

export function emitTestEvent<T>(name: string, detail?: T): void {
  window.dispatchEvent(new CustomEvent<T | undefined>(name, { detail }));
}

// ---- quote search selection: the quote-search modal sets it, the engine reads it (quoteLength [-2]) ----
let selectedQuoteId: number | null = null;
export const getSelectedQuoteId = (): number | null => selectedQuoteId;
export function setSelectedQuoteId(id: number | null): void {
  selectedQuoteId = id;
}
