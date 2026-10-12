import type { Quote } from "../types/test.ts";
import type { FunboxName } from "./config/types.ts";

export const LOCAL_FUNBOXES: readonly FunboxName[] = ["capitals", "ALL_CAPS", "rAnDoMcAsE", "sPoNgEcAsE", "backwards", "ddoouubblleedd", "underscore_spaces", "plus_zero", "plus_one", "plus_two", "plus_three", "rot13", "mirror", "upside_down", "read_ahead_easy", "read_ahead", "read_ahead_hard", "memory", "no_quit", "crt"];

export function transformWords(words: string[], funboxes: readonly FunboxName[], rng: () => number = Math.random): string[] {
  let output = words;
  for (const name of funboxes) {
    output = output.map((word) => {
      if (name === "ALL_CAPS") return word.toUpperCase();
      if (name === "capitals") return word.charAt(0).toUpperCase() + word.slice(1);
      if (name === "backwards") return [...word].reverse().join("");
      if (name === "ddoouubblleedd") return [...word].map((c) => c + c).join("");
      if (name === "rAnDoMcAsE") return [...word].map((c) => rng() < 0.5 ? c.toLowerCase() : c.toUpperCase()).join("");
      if (name === "sPoNgEcAsE") return [...word].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join("");
      if (name === "rot13") return word.replace(/[a-z]/gi, (c) => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() <= "m" ? 13 : -13)));
      const suffix = { plus_zero: "0", plus_one: "1", plus_two: "2", plus_three: "3" }[name as "plus_zero" | "plus_one" | "plus_two" | "plus_three"];
      return suffix ? word + suffix : word;
    });
    if (name === "underscore_spaces") output = [output.join("_")];
  }
  return output;
}

export function parseWordList(value: unknown): string[] {
  if (!Array.isArray(value) || !value.length || !value.every((word) => typeof word === "string" && word.length > 0)) throw new Error("Invalid or empty word list");
  return value as string[];
}

export function parseLayout(value: unknown): string[][][] {
  if (typeof value !== "object" || value === null || !("keys" in value) || typeof value.keys !== "object" || value.keys === null) throw new Error("Invalid keyboard layout");
  const rows = Object.values(value.keys);
  if (!rows.length || !rows.every((row) => Array.isArray(row) && row.every((key) => Array.isArray(key) && key.length && key.every((letter) => typeof letter === "string")))) throw new Error("Invalid keyboard layout keys");
  return rows as string[][][];
}


export function parseQuotes(value: unknown): Quote[] {
  if (typeof value !== "object" || value === null || !("quotes" in value) || !Array.isArray(value.quotes)) throw new Error("Invalid quote data");
  const quotes = value.quotes.filter((quote): quote is Quote => typeof quote === "object" && quote !== null && typeof quote.text === "string" && quote.text.trim().length > 0 && typeof quote.id === "number" && Number.isFinite(quote.id) && typeof quote.length === "number" && Number.isFinite(quote.length) && typeof quote.source === "string");
  if (!quotes.length) throw new Error("No valid quotes available");
  return quotes;
}
