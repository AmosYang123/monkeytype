"use client";

import { useEffect, useRef, useState } from "react";
import { previewTheme, useConfig } from "@/components/ConfigProvider";
import { THEME_NAMES } from "@/lib/config/lists";
import {
  getConfig,
  setConfig,
  setConfigs,
  subscribeConfig,
} from "@/lib/config/store";
import { parseSharedTheme, validLocalBackground } from "@/lib/settings-theme";
import { notify } from "@/lib/notifications";
import { nextRandomTheme, type RandomState } from "@/lib/random-theme";
import { TEST_FINISHED_EVENT } from "@/lib/test-events";
import { THEMES, themeLabel } from "@/lib/theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const SYNC_KEYS = ["autoSwitchTheme", "themeLight", "themeDark", "customTheme"];

/** Auto switch (follows the system scheme) and random theme (new theme after each test). Render once. */
export function ThemeAutomation() {
  const random = useRef<RandomState>({ list: [], index: 0 });
  const { customBackground, customBackgroundSize, customBackgroundFilter } =
    useConfig();
  const [localBackground, setLocalBackground] = useState("");

  useEffect(() => {
    const read = () => {
      try {
        setLocalBackground(
          validLocalBackground(localStorage.getItem("localBackground")),
        );
      } catch {
        setLocalBackground("");
      }
    };
    const previousIsolation = document.body.style.isolation;
    document.body.style.isolation = "isolate";
    read();
    const sharedTheme = parseSharedTheme(
      new URLSearchParams(window.location.search).get("customTheme"),
    );
    if (sharedTheme)
      setConfigs({ customTheme: true, customThemeColors: sharedTheme });
    window.addEventListener("mt:background-changed", read);
    return () => {
      document.body.style.isolation = previousIsolation;
      window.removeEventListener("mt:background-changed", read);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia?.(DARK_QUERY);
    const sync = () => {
      const c = getConfig();
      if (!c.autoSwitchTheme || c.customTheme) return;
      setConfig("theme", mq?.matches ? c.themeDark : c.themeLight);
    };
    sync();
    mq?.addEventListener?.("change", sync);
    const unsub = subscribeConfig((keys) => {
      if (keys.some((k) => SYNC_KEYS.includes(k))) sync();
      if (keys.includes("randomTheme") || keys.includes("favThemes"))
        random.current = { list: [], index: 0 };
      if (keys.includes("randomTheme") && getConfig().randomTheme === "off")
        previewTheme(null);
      // picking a theme clears the random one (source: clearRandom on theme change)
      if (keys.includes("theme") || keys.includes("customTheme"))
        previewTheme(null);
    });
    const onFinished = () => {
      const c = getConfig();
      if (c.randomTheme === "off") return;
      const next = nextRandomTheme(random.current, {
        names: THEME_NAMES,
        mode: c.randomTheme,
        favs: c.favThemes,
        bgOf: (n) => THEMES[n]?.bg,
        prefersDark: !!mq?.matches,
        rng: Math.random,
      });
      if (!next) return;
      // like the source: applied for the session only, the saved theme is untouched
      previewTheme(next.name);
      if (next.wrapped) notify(themeLabel(next.name));
    };
    window.addEventListener(TEST_FINISHED_EVENT, onFinished);
    return () => {
      mq?.removeEventListener?.("change", sync);
      unsub();
      window.removeEventListener(TEST_FINISHED_EVENT, onFinished);
    };
  }, []);

  const background = localBackground || customBackground;
  if (!background) return null;
  const [blur, brightness, saturate, opacity] = customBackgroundFilter;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${JSON.stringify(background)})`,
        backgroundSize:
          customBackgroundSize === "max" ? "100% 100%" : customBackgroundSize,
        filter: `blur(${blur}px) brightness(${brightness}) saturate(${saturate})`,
        opacity,
      }}
    />
  );
}
