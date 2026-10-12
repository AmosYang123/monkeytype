// All word lists are bundled locally, including the large dictionaries.
import { parseWordList } from "./engine-options.ts";

export type LanguageData = {
  name: string;
  words: string[];
  rightToLeft?: boolean;
  noLazyMode?: boolean;
  ligatures?: boolean;
  orderedByFrequency?: boolean;
  bcp47?: string;
};

const cache = new Map<string, Promise<LanguageData>>();

export function languageUrl(name: string): string {
  return `/languages/${encodeURIComponent(name)}.json`;
}

export function loadLanguage(name: string): Promise<LanguageData> {
  let p = cache.get(name);
  if (!p) {
    p = fetch(languageUrl(name)).then(async (res) => {
      if (!res.ok) throw new Error(`language ${name}: HTTP ${res.status}`);
      const json: unknown = await res.json();
      if (typeof json !== "object" || json === null || !("words" in json)) throw new Error("Invalid language data");
      return { name, words: parseWordList(json.words), rightToLeft: "rightToLeft" in json && json.rightToLeft === true };
    });
    // don't cache failures, so a retry can succeed
    p.catch(() => cache.delete(name));
    cache.set(name, p);
  }
  return p;
}

/** Quotes exist per base language (english_1k → english). */
export const quoteLanguage = (language: string) => language.replace(/_\d+k$/, "");
