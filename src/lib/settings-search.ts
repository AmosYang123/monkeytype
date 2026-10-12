// Settings search (ported from monkeytype states/settings-search.ts, GPL-3.0).
// A setting shows only if it ties the best token-match count across all settings:
// 2/2 beats 1/2, and 1/2 shows only when nothing hits 2/2.
import { isValidElement, type ReactNode } from "react";

export function queryTokens(query: string): string[] {
  const q = query.trim().toLowerCase();
  return q === "" ? [] : q.split(/\s+/);
}

/** plain text of a description node so search can match it */
export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

export function scoreOf(haystack: string, tokens: readonly string[]): number {
  return tokens.filter((t) => haystack.includes(t)).length;
}

/** indexes of the haystacks that tie the best score (all of them when there is no query) */
export function matchingIndexes(haystacks: readonly string[], query: string): Set<number> {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return new Set(haystacks.map((_, i) => i));
  const scores = haystacks.map((h) => scoreOf(h, tokens));
  const best = Math.max(0, ...scores);
  return new Set(best > 0 ? scores.flatMap((s, i) => (s === best ? [i] : [])) : []);
}
