import { sanitizeConfig } from "./config/options.ts";
import type { Config } from "./config/types.ts";
import type { Quote } from "../types/test.ts";

export function validSettingsPatch(input: unknown): Partial<Config> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return {};
  const source = input as Record<string, unknown>;
  const valid = sanitizeConfig(source);
  return Object.fromEntries(
    Object.keys(valid).filter((key) => Object.hasOwn(source, key) && JSON.stringify(source[key]) === JSON.stringify(valid[key as keyof Config])).map((key) => [key, valid[key as keyof Config]]),
  );
}

export function parseQuotes(input: unknown): Quote[] {
  if (
    typeof input !== "object" ||
    input === null ||
    !("quotes" in input) ||
    !Array.isArray(input.quotes)
  )
    return [];
  return input.quotes.filter(
    (quote): quote is Quote =>
      typeof quote === "object" &&
      quote !== null &&
      typeof quote.text === "string" && quote.text.trim().length > 0 &&
      typeof quote.source === "string" &&
      Number.isSafeInteger(quote.id) && quote.id >= 0 &&
      Number.isFinite(quote.length) && quote.length > 0,
  );
}

const SHARE_KEYS = [
  "mode",
  "time",
  "words",
  "quoteLength",
  "language",
  "punctuation",
  "numbers",
  "difficulty",
] as const;

export function parseTestAmount(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  const value = Number(text);
  return Number.isSafeInteger(value) && value >= 0 && value <= 100000
    ? value
    : null;
}

export function testSettingsUrl(origin: string, config: Config): string {
  const url = new URL("/", origin);
  SHARE_KEYS.forEach((key) =>
    url.searchParams.set(key, JSON.stringify(config[key])),
  );
  return url.toString();
}

export function readSharedTestSettings(search: string): Partial<Config> {
  const params = new URLSearchParams(search);
  const raw: Record<string, unknown> = {};
  for (const key of SHARE_KEYS) {
    const value = params.get(key);
    if (value !== null) {
      try {
        raw[key] = JSON.parse(value);
      } catch {
        /* malformed link values are ignored */
      }
    }
  }
  return validSettingsPatch(raw);
}
