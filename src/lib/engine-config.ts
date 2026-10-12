import type { Config } from "./config/types.ts";
import type { TestConfig, QuoteLength } from "../types/test.ts";
import type { CustomTextSettings } from "./custom-text.ts";

const lengths: QuoteLength[] = ["short", "medium", "long", "thicc"];
export function engineConfig(config: Config): TestConfig {
  return { ...config, quoteLength: lengths[config.quoteLength[0]] ?? "all" };
}

export function customWords(settings: CustomTextSettings, rng: () => number = Math.random): string[] {
  const sections = settings.limit.mode === "section" && settings.limit.value > 0 ? settings.text.slice(0, Math.floor(settings.limit.value)) : settings.text;
  const source = sections.filter(Boolean).flatMap((section) => settings.pipeDelimiter ? section.trim().split(/\s+/) : [section]);
  if (!source.length) return ["The", "quick", "brown", "fox"];
  const count = settings.limit.mode === "word" && settings.limit.value > 0
    ? Math.floor(settings.limit.value) : settings.limit.mode === "time" ? 100 : source.length;
  const pool = settings.mode === "shuffle" ? [...source] : source;
  if (settings.mode === "shuffle") {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  return Array.from({ length: count }, (_, i) => settings.mode === "random"
    ? pool[Math.floor(rng() * pool.length)] : pool[i % pool.length]);
}
