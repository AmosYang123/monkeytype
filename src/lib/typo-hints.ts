// Typo hints for indicateTypos "below"/"both" (ported from monkeytype test-ui.ts, GPL-3.0).

export type Hint = { indices: number[]; text: string; left: number };
export type LetterBox = { left: number; top: number; width: number };

/** Groups sorted letter indices into runs of consecutive indices: [1,2,5] -> [[1,2],[5]]. */
export function adjacentRuns(indices: readonly number[]): number[][] {
  const runs: number[][] = [];
  for (const i of indices) {
    const last = runs.at(-1);
    if (last && last.at(-1) === i - 1) last.push(i);
    else runs.push([i]);
  }
  return runs;
}

/**
 * monkeytype's joinOverlappingHints (LTR only): neighbouring hints of adjacent wrong
 * letters on the same line merge when they overlap; the merged hint is re-centred.
 * `hintWidth` measures a rendered hint (monkeytype reads offsetWidth after each merge).
 */
export function joinOverlappingHints(hints: readonly Hint[], letters: readonly LetterBox[], hintWidth: (text: string) => number): Hint[] {
  const runs = adjacentRuns(hints.map((hint) => hint.indices[0]));
  const out = hints.map((hint) => ({ ...hint, indices: [...hint.indices] }));
  let previousAdjacent = false;
  let i = 0;
  while (i < out.length - 1) {
    const a = out[i];
    const b = out[i + 1];
    const first = letters[a.indices[0]];
    const adjacent = runs.some((run) => run.includes(a.indices[0]) && run.includes(b.indices[0]));
    if (!adjacent || !first) {
      i++;
      previousAdjacent = false;
      continue;
    }
    const sameTop = first.top === letters[b.indices[0]]?.top;
    // hints are translate(-50%), so their edges sit half a width either side of `left`
    if (sameTop && a.left + hintWidth(a.text) / 2 > b.left - hintWidth(b.text) / 2) {
      out.splice(i, 2, { indices: [...a.indices, ...b.indices], text: a.text + b.text, left: first.left + (b.left - a.left) });
      if (previousAdjacent && i > 0) i--;
    } else {
      i++;
    }
    previousAdjacent = true;
  }
  return out;
}
