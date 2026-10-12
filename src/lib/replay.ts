// Keystroke-log helpers (upstream test/events/stats.ts + result/replay.ts): replay frames, corrected letters, missed words, afk.
import type { TestEvent } from "../types/test.ts";

/** the engine's inputs array after every event strictly before `ms` */
export function replayInputs(events: TestEvent[], ms: number): string[] {
  const inputs = [""];
  for (const e of events) {
    if (e.ms >= ms) break;
    inputs.length = e.word + 1;
    inputs[e.word] = e.input;
  }
  return Array.from(inputs, (input) => input ?? "");
}

/** upstream jumpToLetter: time of the first event that reaches word `word`, letter `letter` */
export function jumpTime(events: TestEvent[], word: number, letter: number): number {
  let active = 0;
  let length = 0;
  for (const e of events) {
    if (active > word || (active === word && length >= letter)) return e.ms;
    active = e.word;
    length = [...e.input].length;
  }
  return Infinity;
}

/** upstream replay stats line: wpm of the last whole second, then the second */
export function replayStats(seconds: number, wpmHistory: number[]): string {
  return `${wpmHistory[seconds - 1] ?? 0}wpm\t${seconds}s`;
}

/** upstream getCorrectedWordsHistory: per word, the last deleted char at each position, else the typed one */
export function correctedHistory(events: TestEvent[]): string[] {
  const inputs: string[] = [""];
  const typed: string[][] = [];
  const deleted: (string | undefined)[][] = [];
  const change = (word: number, next: string) => {
    const old = [...(inputs[word] ?? "")];
    const chars = [...next];
    const del = (deleted[word] ??= []);
    for (let p = chars.length; p < old.length; p++) del[p] = old[p];
    const cur = (typed[word] ??= []);
    chars.forEach((ch, p) => { cur[p] = ch; });
    inputs[word] = next;
  };
  for (const e of events) {
    inputs.length = e.word + 1;
    // a char removed again by deleteOnError still counts as typed, then deleted
    if (e.char !== undefined) change(e.word, (inputs[e.word] ?? "") + e.char);
    change(e.word, e.input);
  }
  return Array.from(typed, (cur, word) => Array.from(cur ?? [], (ch, p) => deleted[word]?.[p] ?? ch).join(""));
}

/** upstream getMissedWords: every target that got a wrong key (char or space), even if fixed later */
export function missedWords(events: TestEvent[], targets: string[]): string[] {
  const missed = new Set<string>();
  let active = 0;
  for (const e of events) {
    const target = targets[e.type === "space" ? active : e.word];
    if (!e.correct && target !== undefined) missed.add(target);
    active = e.word;
  }
  return [...missed];
}

/** events per one-second bucket (upstream countPerInterval over getTimerBoundaries) */
function perSecond(events: TestEvent[], endMs: number, timed: boolean, counts: (e: TestEvent) => boolean): number[] {
  const boundaries = Array.from({ length: Math.floor(endMs / 1000) }, (_, i) => (i + 1) * 1000);
  // non-timed tests get a fractional tail bucket for a .5s+ remainder
  if (!timed && (Math.round(endMs / 10) / 100) % 1 >= 0.5) boundaries.push(endMs);
  const out: number[] = [];
  let k = 0;
  for (const boundary of boundaries) {
    let n = 0;
    for (; k < events.length && events[k].ms <= boundary; k++) if (counts(events[k])) n++;
    out.push(n);
  }
  return out;
}

/** upstream getAfkDuration (seconds with no key at all) and afkDetected (no char/space in the last 5 seconds) */
export function afkStats(events: TestEvent[], endMs: number, timed: boolean): { afkDuration: number; afkDetected: boolean } {
  return {
    afkDuration: perSecond(events, endMs, timed, () => true).filter((n) => n === 0).length,
    afkDetected: perSecond(events, endMs, timed, (e) => e.type !== "backspace").slice(-5).every((n) => n === 0),
  };
}
