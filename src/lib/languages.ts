// Loads monkeytype word lists: vendored ones from /languages, big ones via the caching proxy.
import { REMOTE_LANGUAGES } from "@/data/remote-languages";

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
  return REMOTE_LANGUAGES.includes(name) ? `/api/languages/${name}` : `/languages/${name}.json`;
}

export function loadLanguage(name: string): Promise<LanguageData> {
  let p = cache.get(name);
  if (!p) {
    p = fetch(languageUrl(name)).then(async (res) => {
      if (!res.ok) throw new Error(`language ${name}: HTTP ${res.status}`);
      return (await res.json()) as LanguageData;
    });
    // don't cache failures, so a retry can succeed
    p.catch(() => cache.delete(name));
    cache.set(name, p);
  }
  return p;
}

/** Quotes exist per base language (english_1k → english). */
export const quoteLanguage = (language: string) => language.replace(/_\d+k$/, "");
