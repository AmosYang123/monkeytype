// Applies a monkeytype theme by setting the 10 color variables on <html>,
// plus the optional per-theme stylesheet (/themes/<name>.css) some themes ship.
import themes from "@/data/themes.json";

export type ThemeColors = {
  bg: string;
  main: string;
  caret: string;
  sub: string;
  subAlt: string;
  text: string;
  error: string;
  errorExtra: string;
  colorfulError: string;
  colorfulErrorExtra: string;
  hasCss?: boolean;
};

export const THEMES = themes as Record<string, ThemeColors>;

/** CSS variable for each color, in the order monkeytype stores customThemeColors. */
export const COLOR_VARS: [keyof ThemeColors, string][] = [
  ["bg", "--bg-color"],
  ["main", "--main-color"],
  ["caret", "--caret-color"],
  ["sub", "--sub-color"],
  ["subAlt", "--sub-alt-color"],
  ["text", "--text-color"],
  ["error", "--error-color"],
  ["errorExtra", "--error-extra-color"],
  ["colorfulError", "--colorful-error-color"],
  ["colorfulErrorExtra", "--colorful-error-extra-color"],
];

export const themeLabel = (name: string) => name.replace(/_/g, " ");

export function colorsFromCustom(list: readonly string[]): ThemeColors {
  const at = (i: number) => list[i] ?? "#000000";
  return {
    bg: at(0),
    main: at(1),
    caret: at(2),
    sub: at(3),
    subAlt: at(4),
    text: at(5),
    error: at(6),
    errorExtra: at(7),
    colorfulError: at(8),
    colorfulErrorExtra: at(9),
  };
}

const LINK_ID = "theme-css";

/** Sets the theme on the document. `name` is ignored for custom colors. */
export function applyTheme(colors: ThemeColors, name: string | null): void {
  const root = document.documentElement;
  for (const [key, cssVar] of COLOR_VARS) root.style.setProperty(cssVar, String(colors[key]));
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors.bg);

  const existing = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  const href = name && colors.hasCss ? `/themes/${name}.css` : null;
  if (!href) {
    existing?.remove();
    return;
  }
  if (existing?.getAttribute("href") === href) return;
  const link = existing ?? document.createElement("link");
  link.id = LINK_ID;
  link.rel = "stylesheet";
  link.href = href;
  if (!existing) document.head.appendChild(link);
}

export function applyNamedTheme(name: string): void {
  const colors = THEMES[name] ?? THEMES.serika_dark;
  applyTheme(colors, THEMES[name] ? name : "serika_dark");
}
