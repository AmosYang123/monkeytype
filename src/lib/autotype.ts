// "open sesame": typed into the custom text box it arms an autotyper that, on Enter, types the test
// at a steady pace. "close sesame" disarms it. Armed speed persists in localStorage ("sesame").
const KEY = "sesame";
export const AUTOTYPE_DEFAULT_WPM = 150;
const MIN_WPM = 10;
const MAX_WPM = 300;

export type SesameCommand = { type: "open"; wpm: number } | { type: "close" };

/** "open sesame [wpm]" / "close sesame", any case and spacing; anything else is ordinary custom text. */
export function parseSesame(text: string): SesameCommand | null {
  const t = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (t === "close sesame") return { type: "close" };
  const m = /^open sesame(?: (\d{1,4}))?$/.exec(t);
  if (!m) return null;
  const wpm = m[1] === undefined ? AUTOTYPE_DEFAULT_WPM : Math.min(MAX_WPM, Math.max(MIN_WPM, Number(m[1])));
  return { type: "open", wpm };
}

/** ms between keystrokes; a space counts as one char and a word is 5 chars */
export const msPerKey = (wpm: number): number => 60_000 / (wpm * 5);

export type AutotypeCursor = { word: number; char: number };

/** Next key for an always-correct typist: each letter of the word, then a space. null past the last word. */
export function autotypeKey(words: readonly string[], c: AutotypeCursor): { key: string; next: AutotypeCursor } | null {
  const word = words[c.word];
  if (word === undefined) return null;
  const letters = [...word];
  if (c.char < letters.length) return { key: letters[c.char], next: { word: c.word, char: c.char + 1 } };
  return { key: " ", next: { word: c.word + 1, char: 0 } };
}

// ---- armed state ----
let armedWpm: number | null = null;
const listeners = new Set<() => void>();

/** 0 = closed */
export function getSesameWpm(): number {
  if (armedWpm !== null) return armedWpm;
  try {
    const n = Number(localStorage.getItem(KEY) ?? 0);
    armedWpm = Number.isFinite(n) && n >= MIN_WPM && n <= MAX_WPM ? n : 0;
  } catch {
    armedWpm = 0;
  }
  return armedWpm;
}

export function setSesameWpm(wpm: number): void {
  armedWpm = wpm;
  try {
    if (wpm) localStorage.setItem(KEY, String(wpm));
    else localStorage.removeItem(KEY);
  } catch {
    // ignore: applies for this session only
  }
  listeners.forEach((l) => l());
}

export function subscribeSesame(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
