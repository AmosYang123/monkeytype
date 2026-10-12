// Pace caret math (ported from monkeytype test/pace-caret.ts, GPL-3.0). Pure: the DOM side lives in Words.tsx.
import type { Config } from "./config/types.ts";

export type PaceState = {
  wordIndex: number;
  /** letterIndex === word length is the slot after the last letter (the space) */
  letterIndex: number;
  /** pending jump in chars: +len for a word committed wrong, -len once it is fixed */
  correction: number;
  /** word indices currently counted as committed wrong */
  wrong: ReadonlySet<number>;
};

export const initialPace: PaceState = { wordIndex: 0, letterIndex: 0, correction: 0, wrong: new Set() };

type PaceInput = Pick<Config, "paceCaret" | "paceCaretCustomSpeed" | "repeatedPace"> & { averageWpm: number; lastWpm: number; isRepeated: boolean };

/** Target wpm, 0 = no pace caret. pb / tagPb / daily need data the clone does not keep, so they stay off. */
export function paceCaretWpm(i: PaceInput): number {
  let wpm = 0;
  if (i.paceCaret === "average") wpm = i.averageWpm;
  else if (i.paceCaret === "custom") wpm = i.paceCaretCustomSpeed;
  else if (i.paceCaret === "last" || (i.paceCaret === "off" && i.repeatedPace && i.isRepeated)) wpm = i.lastWpm;
  return Number.isFinite(wpm) && wpm >= 1 ? wpm : 0;
}

/** seconds the caret spends on one char (a space counts as one) */
export const secondsPerChar = (wpm: number): number => 60 / (wpm * 5);

const len = (words: readonly string[], i: number): number | undefined => (words[i] === undefined ? undefined : [...words[i]].length);

/** Next caret slot, applying any pending correction; null once it runs past the last word. */
export function stepPace(words: readonly string[], s: PaceState, blind: boolean): PaceState | null {
  let { wordIndex, letterIndex, correction } = s;
  const here = len(words, wordIndex);
  if (here === undefined) return null;
  if (letterIndex >= here) {
    letterIndex = -1;
    wordIndex++;
  }
  letterIndex++;
  if (!blind) {
    while (correction < 0) {
      letterIndex--;
      if (letterIndex <= -1) {
        const prev = len(words, wordIndex - 1);
        if (prev === undefined) return null;
        letterIndex = prev;
        wordIndex--;
      }
      correction++;
    }
    while (correction > 0) {
      letterIndex++;
      const cur = len(words, wordIndex);
      if (cur === undefined) return null;
      if (letterIndex >= cur + 1) {
        letterIndex = 0;
        wordIndex++;
      }
      correction--;
    }
  }
  return { ...s, wordIndex, letterIndex, correction };
}

/** A word was committed with space: wrong words push the caret ahead by their length, fixing one takes it back. */
export function commitPaceWord(s: PaceState, index: number, wordLength: number, correct: boolean, blind: boolean): PaceState {
  if (blind) return s;
  if (correct && s.wrong.has(index)) {
    const wrong = new Set(s.wrong);
    wrong.delete(index);
    return { ...s, wrong, correction: s.correction - wordLength };
  }
  if (!correct && !s.wrong.has(index)) return { ...s, wrong: new Set(s.wrong).add(index), correction: s.correction + wordLength };
  return s;
}
