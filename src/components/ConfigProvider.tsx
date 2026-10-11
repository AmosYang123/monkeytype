"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getDefaultConfig } from "@/lib/config/defaults";
import { FONTS } from "@/lib/config/lists";
import { getConfig, loadConfig, subscribeConfig } from "@/lib/config/store";
import type { Config } from "@/lib/config/types";
import { COLOR_VARS, THEMES, applyTheme, colorsFromCustom, type ThemeColors } from "@/lib/theme";

const SERVER_CONFIG = getDefaultConfig();

/** Current config; re-renders on any change. */
export function useConfig(): Config {
  return useSyncExternalStore(subscribeConfig, getConfig, () => SERVER_CONFIG);
}

// ---- theme preview (command line hover / settings hover) ----
let preview: string | null = null;
const previewListeners = new Set<() => void>();
export function previewTheme(name: string | null): void {
  preview = name;
  previewListeners.forEach((l) => l());
}
function usePreviewTheme(): string | null {
  return useSyncExternalStore(
    (l) => {
      previewListeners.add(l);
      return () => previewListeners.delete(l);
    },
    () => preview,
    () => null,
  );
}

export function fontCssFamily(name: string): string {
  return name.replace(/_/g, " ");
}

function applyFont(name: string): string {
  const entry = FONTS.find((f) => f.name === name);
  const family = fontCssFamily(name);
  let style = document.getElementById("font-face") as HTMLStyleElement | null;
  if (entry?.fileName) {
    if (!style) {
      style = document.createElement("style");
      style.id = "font-face";
      document.head.appendChild(style);
    }
    style.textContent = `@font-face{font-family:"${family}";font-display:block;font-weight:${entry.weight ?? 400};src:url(/webfonts/${entry.fileName}) format("woff2")}`;
  }
  document.documentElement.style.setProperty("--font", `"${family}", "Roboto Mono", monospace`);
  return family;
}

/** Loads the saved config and keeps theme + font applied to the document. Render once. */
export function ConfigEffects() {
  const config = useConfig();
  const previewName = usePreviewTheme();

  useEffect(() => {
    loadConfig();
  }, []);

  const { theme, customTheme, customThemeColors, fontFamily } = config;
  useEffect(() => {
    let colors: ThemeColors;
    let name: string | null;
    if (previewName && THEMES[previewName]) {
      colors = THEMES[previewName];
      name = previewName;
    } else if (customTheme) {
      colors = colorsFromCustom(customThemeColors);
      name = null;
    } else {
      colors = THEMES[theme] ?? THEMES.serika_dark;
      name = THEMES[theme] ? theme : "serika_dark";
    }
    applyTheme(colors, name);
    if (previewName) return; // don't persist a hover preview
    const font = applyFont(fontFamily);
    try {
      const boot = Object.fromEntries(COLOR_VARS.map(([k, v]) => [v, String(colors[k])]));
      localStorage.setItem("themeBoot", JSON.stringify({ colors: boot, font }));
    } catch {
      // no storage: boot script just uses the default theme
    }
  }, [theme, customTheme, customThemeColors, fontFamily, previewName]);

  return null;
}
