// Funbox compatibility rules (ported from monkeytype packages/funbox/src/validation.ts, GPL-3.0).
import { FUNBOXES, type FunboxEntry } from "./config/lists.ts";

function intersect<T>(a: readonly T[], b: readonly T[]): T[] {
  return [...new Set(a.filter((e) => b.includes(e)))];
}

const hasProp = (f: FunboxEntry, prop: string): boolean => f.properties?.includes(prop) ?? false;
const hasFn = (f: FunboxEntry, fn: string): boolean => f.frontendFunctions?.includes(fn) ?? false;
const count = (list: FunboxEntry[], pred: (f: FunboxEntry) => boolean): number => list.filter(pred).length;

/** true when the given funboxes (plus `withFunbox`, if any) can be active together */
export function checkCompatibility(funboxNames: readonly string[], withFunbox?: string): boolean {
  const names = withFunbox === undefined ? [...funboxNames] : [...funboxNames, withFunbox];
  const list: FunboxEntry[] = [];
  for (const name of names) {
    const entry = FUNBOXES.find((f) => f.name === name);
    if (!entry) return false;
    list.push(entry);
  }

  const wordModifier = (f: FunboxEntry) => hasFn(f, "getWord") || hasFn(f, "pullSection") || hasFn(f, "withWords");
  const toPush = (f: FunboxEntry) => f.properties?.some((p) => p.startsWith("toPush")) ?? false;
  const none = (prop: string) => count(list, (f) => hasProp(f, prop)) === 0;
  const speaks = count(list, (f) => hasProp(f, "speaks"));

  const oneWordModifierMax = count(list, wordModifier) <= 1;
  const oneWordOrderMax = count(list, (f) => f.properties?.some((p) => p.startsWith("wordOrder")) ?? false) <= 1;
  const layoutUsability = none("changesLayout") || (none("ignoresLayout") && none("usesLayout"));
  const oneNospaceOrToPushMax = count(list, (f) => hasProp(f, "nospace") || toPush(f)) <= 1;
  const oneChangesWordsVisibilityMax = count(list, (f) => hasProp(f, "changesWordsVisibility")) <= 1;
  const oneFrequencyChangesMax = count(list, (f) => hasProp(f, "changesWordsFrequency")) <= 1;
  const noFrequencyChangesConflicts = none("changesWordsFrequency") || none("ignoresLanguage");
  const capitalisationChangePosibility = none("noLetters") || none("changesCapitalisation");
  const noConflictsWithSymmetricChars = none("conflictsWithSymmetricChars") || none("symmetricChars");
  const oneCanSpeakMax = speaks <= 1;
  const hasLanguageToSpeakAndNoUnspeakable =
    speaks === 0 || (speaks === 1 && none("unspeakable")) || none("ignoresLanguage");
  const oneToPushOrPullSectionMax =
    count(list, (f) => (f.properties?.some((p) => p.startsWith("toPush:")) ?? false) || hasFn(f, "pullSection")) <= 1;
  const onePunctuateWordMax = count(list, (f) => hasFn(f, "punctuateWord")) <= 1;
  const oneGetEmulatedCharMax = count(list, (f) => hasFn(f, "getEmulatedChar")) <= 1;
  const oneCharReplacerMax = count(list, (f) => hasFn(f, "getWordHtml")) <= 1;
  const oneChangesCapitalisationMax = count(list, (f) => hasProp(f, "changesCapitalisation")) <= 1;

  const cssCounts: Record<string, number> = {};
  for (const css of list.flatMap((f) => f.cssModifications ?? [])) cssCounts[css] = (cssCounts[css] ?? 0) + 1;
  const oneCssModificationPerElement = Object.values(cssCounts).every((c) => c <= 1);

  const allowed: Record<string, (string | number | boolean)[]> = {};
  let noConfigConflicts = true;
  for (const f of list) {
    for (const [key, values] of Object.entries(f.frontendForcedConfig ?? {})) {
      const prev = allowed[key];
      if (prev === undefined) allowed[key] = values;
      else {
        allowed[key] = intersect(prev, values);
        if (allowed[key].length === 0) noConfigConflicts = false;
      }
    }
  }

  return (
    oneWordModifierMax &&
    layoutUsability &&
    oneNospaceOrToPushMax &&
    oneChangesWordsVisibilityMax &&
    oneFrequencyChangesMax &&
    noFrequencyChangesConflicts &&
    capitalisationChangePosibility &&
    noConflictsWithSymmetricChars &&
    oneCanSpeakMax &&
    hasLanguageToSpeakAndNoUnspeakable &&
    oneToPushOrPullSectionMax &&
    onePunctuateWordMax &&
    oneGetEmulatedCharMax &&
    oneCharReplacerMax &&
    oneChangesCapitalisationMax &&
    oneCssModificationPerElement &&
    noConfigConflicts &&
    oneWordOrderMax
  );
}
