// Custom text settings (port of monkeytype test/custom-text.ts state).
// localStorage keys match the live site: customTextSettings, customText (saved texts).
export type CustomTextMode = "repeat" | "random" | "shuffle";
export type CustomTextLimitMode = "word" | "time" | "section";
export type CustomTextSettings = {
  text: string[];
  mode: CustomTextMode;
  limit: { value: number; mode: CustomTextLimitMode };
  pipeDelimiter: boolean;
};

const SETTINGS_KEY = "customTextSettings";
const SAVED_KEY = "customText";

export const DEFAULT_CUSTOM_TEXT: CustomTextSettings = {
  text: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"],
  mode: "repeat",
  limit: { value: 9, mode: "word" },
  pipeDelimiter: false,
};

const MODES: readonly CustomTextMode[] = ["repeat", "random", "shuffle"];
const LIMIT_MODES: readonly CustomTextLimitMode[] = ["word", "time", "section"];

/** Validates unknown JSON into settings; anything malformed falls back to the default field. */
export function parseCustomTextSettings(input: unknown): CustomTextSettings {
  const d = structuredClone(DEFAULT_CUSTOM_TEXT);
  if (typeof input !== "object" || input === null) return d;
  const o = input as Record<string, unknown>;
  if (Array.isArray(o.text) && o.text.every((w) => typeof w === "string")) d.text = o.text as string[];
  if (typeof o.mode === "string" && MODES.includes(o.mode as CustomTextMode)) d.mode = o.mode as CustomTextMode;
  if (typeof o.limit === "object" && o.limit !== null) {
    const l = o.limit as Record<string, unknown>;
    if (typeof l.value === "number" && Number.isFinite(l.value) && l.value >= 0) d.limit.value = l.value;
    if (typeof l.mode === "string" && LIMIT_MODES.includes(l.mode as CustomTextLimitMode)) d.limit.mode = l.mode as CustomTextLimitMode;
  }
  if (typeof o.pipeDelimiter === "boolean") d.pipeDelimiter = o.pipeDelimiter;
  return d;
}

let settings: CustomTextSettings | null = null;
const listeners = new Set<() => void>();

function load(): CustomTextSettings {
  if (settings) return settings;
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(SETTINGS_KEY);
    settings = parseCustomTextSettings(raw ? JSON.parse(raw) : null);
  } catch {
    settings = structuredClone(DEFAULT_CUSTOM_TEXT);
  }
  return settings;
}

export const getCustomText = (): CustomTextSettings => load();

export function subscribeCustomText(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function setCustomText(patch: Partial<CustomTextSettings>): void {
  settings = parseCustomTextSettings({ ...load(), ...patch });
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore: applies for this session only
  }
  listeners.forEach((l) => l());
}

// ---- saved texts ----
export function getSavedTexts(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const o: unknown = raw ? JSON.parse(raw) : {};
    if (typeof o !== "object" || o === null) return {};
    return Object.fromEntries(Object.entries(o).filter((e): e is [string, string] => typeof e[1] === "string"));
  } catch {
    return {};
  }
}

export function saveText(name: string, text: string): void {
  const all = { ...getSavedTexts(), [name]: text };
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function deleteSavedText(name: string): void {
  const all = getSavedTexts();
  delete all[name];
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}
