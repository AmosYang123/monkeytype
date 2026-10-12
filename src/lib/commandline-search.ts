// Command line search helpers (ported from monkeytype commandline/filter + cl-lists getSingleSubgroup, GPL-3.0).

/** "Theme..." -> "Theme", the parent label shown before the chevron in the single list */
export function stripEllipsis(display: string): string {
  return display.replace(/\s?\.\.\.$/, "");
}

export type Searchable = { display: string; alias?: string };

const stripPunctuation = (text: string): string => text.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");
const splitWords = (text: string): string[] => text.toLowerCase().split(" ").map(stripPunctuation);

/**
 * Port of monkeytype's commandline/filter findMatchingCommands. Each input word can match the
 * start of one word of a command's display or alias; only commands with the highest match count
 * and match strength (total matched characters) are kept. A leading ">" is ignored.
 * `display` should already include the parent label when searching the single list.
 */
export function findMatchingCommands(commands: readonly Searchable[], input: string): boolean[] {
  const inputSplit = input
    .replace(/^>/, "")
    .toLowerCase()
    .trim()
    .split(" ")
    .map(stripPunctuation)
    .filter(Boolean);
  const matches = commands.map((command) => {
    if (inputSplit.length === 0) return { matchCount: 0, matchStrength: 0 };
    const words = splitWords(command.display).concat(command.alias === undefined ? [] : splitWords(command.alias));
    const matchedBy: (number | null)[] = words.map(() => null);
    let matchStrength = 0;
    inputSplit.forEach((inputWord, inputIndex) => {
      words.forEach((word, wordIndex) => {
        if (word.startsWith(inputWord) && matchedBy[wordIndex] === null && !matchedBy.includes(inputIndex)) {
          matchedBy[wordIndex] = inputIndex;
          matchStrength += inputWord.length;
        }
      });
    });
    return { matchCount: matchedBy.filter((i) => i !== null).length, matchStrength };
  });
  const maxMatchStrength = Math.max(...matches.map((m) => m.matchStrength));
  let minMatchCount = inputSplit.length;
  while (minMatchCount > 0 && !matches.some((m) => m.matchCount >= minMatchCount)) minMatchCount--;
  if (inputSplit.length > 0 && minMatchCount === 0) minMatchCount = 1;
  return matches.map((m) => m.matchCount >= minMatchCount && m.matchStrength >= maxMatchStrength);
}

/** a leading ">" opens the single list even when singleListCommandLine is off */
export function parseSearch(
  raw: string,
  singleListSetting: string,
): { single: boolean; query: string } {
  const prefixed = raw.startsWith(">");
  return {
    single: singleListSetting === "on" || prefixed,
    query: prefixed ? raw.slice(1) : raw,
  };
}
