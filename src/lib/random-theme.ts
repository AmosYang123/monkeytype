// Random theme picking (port of monkeytype's theme-controller randomizeTheme / changeThemeList).
// Pure: callers pass the bg lookup and rng so it is testable without the theme data.
import type { RandomTheme } from "./config/types.ts";

/** monkeytype's classification: HSL lightness of the bg color, >= 50 is light. */
export function isLightColor(hex: string): boolean {
  const h = hex.length === 4 || hex.length === 5 ? [...hex.slice(1, 4)].map((c) => c + c).join("") : hex.slice(1, 7);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  if ([r, g, b].some(Number.isNaN)) return false;
  return Math.round(((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 1000) / 10 >= 50;
}

export function shuffle<T>(list: T[], rng: () => number): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

type ListOptions = {
  names: readonly string[];
  mode: RandomTheme;
  favs: readonly string[];
  bgOf: (name: string) => string | undefined;
};

/** The pool a mode draws from ("custom" needs account themes: empty here). */
export function themePool({ names, mode, favs, bgOf }: ListOptions): string[] {
  const light = (n: string) => isLightColor(bgOf(n) ?? "#000000");
  if (mode === "fav" && favs.length > 0) return [...favs];
  if (mode === "light") return names.filter(light);
  if (mode === "dark") return names.filter((n) => !light(n));
  if (mode === "on" || mode === "auto") return [...names];
  return [];
}

export type RandomState = { list: string[]; index: number };

/**
 * Next theme from the shuffled cycle (every theme once before any repeats). `auto` skips themes
 * not matching the system scheme. `wrapped` is true when the cycle just ended (source shows a notice).
 */
export function nextRandomTheme(
  state: RandomState,
  opts: ListOptions & { prefersDark: boolean; rng: () => number },
): { name: string; wrapped: boolean } | null {
  if (state.list.length === 0) state.list = shuffle(themePool(opts), opts.rng);
  if (state.list.length === 0) return null;
  const fits = (n: string) => opts.mode !== "auto" || isLightColor(opts.bgOf(n) ?? "#000000") === !opts.prefersDark;
  let name = state.list[state.index];
  let wrapped = false;
  for (let tries = 0; tries < state.list.length * 2; tries++) {
    name = state.list[state.index];
    state.index++;
    if (state.index >= state.list.length) {
      shuffle(state.list, opts.rng);
      state.index = 0;
      wrapped = true;
    }
    if (fits(name)) return { name, wrapped };
  }
  // ponytail: no theme matches the system scheme (never with the real list); fall back to any
  return { name, wrapped };
}
