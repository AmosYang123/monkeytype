// Typing-test state machine. Pure: time is passed in, words are passed in.
import type { ChartData, TestConfig, TestEvent, TestResult } from "../types/test.ts";
import { accuracy, burstWpm, consistency, countChars, flexBurstThreshold, wpmFrom } from "./typing.ts";
import { afkStats } from "./replay.ts";

const MAX_EXTRA = 20;

export type TestState = {
  /** bumps on every reset; lets views remount per test */
  resetId: number;
  config: TestConfig;
  words: string[];
  /** committed words + the in-progress word (always last, never empty array) */
  inputs: string[];
  startTime: number | null;
  wordStartTime: number | null;
  wordDurations: number[];
  /** burst wpm per committed word (see burstWpm) */
  wordBursts: number[];
  isRepeated: boolean;
  lastSecond: number;
  finished: boolean;
  result: TestResult | null;
  failReason?: string;
  keys: { correct: number; total: number };
  /** keys / errors typed since the last whole-second sample */
  secondKeys: number;
  secondErrors: number;
  chart: ChartData;
  /** every applied key, for replay / corrected letters / missed words / afk */
  events: TestEvent[];
};

export type TestAction =
  | { type: "reset"; config: TestConfig; words: string[]; repeated?: boolean }
  | { type: "appendWords"; words: string[] }
  | { type: "char"; char: string; now: number }
  | { type: "space"; now: number }
  | { type: "backspace"; word: boolean; now: number }
  | { type: "tick"; now: number }
  | { type: "finish"; now: number };

const emptyChart = (): ChartData => ({ labels: [], wpm: [], raw: [], burst: [], err: [] });

export const initialState = (config: TestConfig, words: string[], resetId = 0, isRepeated = false): TestState => ({
  resetId,
  config,
  words,
  inputs: [""],
  startTime: null,
  wordStartTime: null,
  wordDurations: [],
  wordBursts: [],
  isRepeated,
  lastSecond: 0,
  finished: false,
  result: null,
  keys: { correct: 0, total: 0 },
  secondKeys: 0,
  secondErrors: 0,
  chart: emptyChart(),
  events: [],
});

const isZen = (s: TestState) => s.config.mode === "zen";
const targetsOf = (s: TestState) => {
  const targets = isZen(s) ? s.inputs : s.words;
  return s.config.lazyMode ? targets.map((word) => word.toLocaleLowerCase()) : targets;
};
const inputsOf = (s: TestState) => s.config.lazyMode ? s.inputs.map((word) => word.toLocaleLowerCase()) : s.inputs;
export const testDuration = (config: TestConfig) => config.mode === "time" ? config.time : config.duration ?? 0;
export const isContinuousTest = (config: TestConfig) => config.mode === "time" || config.duration !== undefined || config.mode === "words" && config.words === 0;
export const canFinishManually = (config: TestConfig) => config.mode === "zen" || isContinuousTest(config) && testDuration(config) === 0;

const elapsed = (s: TestState, now: number) => (s.startTime === null ? 0 : (now - s.startTime) / 1000);

/** Adds one chart sample per whole second that passed since the last one. */
function sample(s: TestState, now: number, partial = false): TestState {
  const secs = elapsed(s, now);
  const target = partial ? Math.ceil(secs) : Math.floor(secs);
  if (target <= s.lastSecond) return s;
  const counts = countChars(targetsOf(s), inputsOf(s), false);
  const chart = { labels: [...s.chart.labels], wpm: [...s.chart.wpm], raw: [...s.chart.raw], burst: [...s.chart.burst], err: [...s.chart.err] };
  // one sample per second; keys pressed since the last sample land on the newest second
  for (let sec = s.lastSecond + 1; sec <= target; sec++) {
    const isNewest = sec === target;
    const span = isNewest && partial ? secs : sec;
    const secondLen = isNewest && partial ? Math.max(secs - (sec - 1), 0.001) : 1;
    chart.labels.push(String(sec));
    chart.wpm.push(Math.round(wpmFrom(counts.correctWordChars, span)));
    chart.raw.push(Math.round(wpmFrom(counts.allChars, span)));
    chart.burst.push(isNewest ? Math.round(wpmFrom(s.secondKeys, secondLen)) : 0);
    chart.err.push(isNewest ? s.secondErrors : 0);
  }
  return { ...s, chart, lastSecond: target, secondKeys: 0, secondErrors: 0 };
}

function testType(c: TestConfig): string[] {
  const head =
    c.mode === "time" ? `time ${c.time}` : c.mode === "words" ? `words ${c.words}` : c.mode;
  return [head, c.language ?? "english", ...(c.punctuation ? ["punctuation"] : []), ...(c.numbers ? ["numbers"] : [])];
}

function finish(s: TestState, now: number, timed = false): TestState {
  if (s.finished || s.startTime === null) return s;
  const fixedTime = timed && testDuration(s.config) > 0 && !s.failReason ? testDuration(s.config) : null;
  const end = fixedTime === null ? now : s.startTime + fixedTime * 1000;
  const sampled = sample(s, end, fixedTime === null);
  const secs = fixedTime ?? elapsed(s, now);
  const chars = countChars(targetsOf(sampled), inputsOf(sampled), true);
  const last = sampled.inputs.length - 1;
  const wordBursts = sampled.wordBursts.length <= last && sampled.inputs[last] !== ""
    ? [...sampled.wordBursts, burstWpm([...sampled.inputs[last]].length, end - (sampled.wordStartTime ?? end))]
    : sampled.wordBursts;
  const result: TestResult = {
    wpm: wpmFrom(chars.correctWordChars, secs),
    raw: wpmFrom(chars.allChars, secs),
    acc: accuracy(s.keys.correct, s.keys.total),
    consistency: consistency(sampled.chart.burst),
    chars,
    seconds: secs,
    testType: testType(s.config),
    chart: sampled.chart,
    failed: Boolean(s.failReason),
    failReason: s.failReason,
    wordBursts,
    isRepeated: s.isRepeated,
    // filled in by testReducer once the finishing key is logged
    afkDuration: 0,
    afkDetected: false,
  };
  return { ...sampled, finished: true, result, wordBursts, wordDurations: [...sampled.wordDurations.slice(0, sampled.inputs.length - 1), end - (sampled.wordStartTime ?? end)] };
}

function fail(s: TestState, now: number, reason: string): TestState {
  return finish({ ...s, failReason: reason }, now);
}

const matches = (s: TestState, typed: string, target: string) =>
  s.config.lazyMode ? typed.toLocaleLowerCase() === target.toLocaleLowerCase() : typed === target;

export function testReducer(s: TestState, a: TestAction): TestState {
  let next = step(s, a);
  // keys that only end a timed-out test leave `keys` untouched and are not logged
  if ((a.type === "char" || a.type === "space" || a.type === "backspace") && next !== s && next.startTime !== null && (a.type === "backspace" || next.keys !== s.keys)) {
    const word = next.inputs.length - 1;
    const correct = a.type === "backspace" || next.keys.correct > s.keys.correct;
    const inserted = a.type === "char" && !(s.config.stopOnError === "letter" && !correct);
    const event: TestEvent = { ms: a.now - next.startTime, type: a.type, word, input: next.inputs[word], correct, ...(inserted ? { char: a.char } : {}) };
    next = { ...next, events: [...next.events, event] };
  }
  if (next.result && !s.result) next = { ...next, result: { ...next.result, ...afkStats(next.events, next.result.seconds * 1000, isContinuousTest(next.config)) } };
  return next;
}

function step(s: TestState, a: TestAction): TestState {
  if (a.type === "reset") return initialState(a.config, a.words, s.resetId + 1, a.repeated);
  if (s.finished) return s;
  if (a.type === "appendWords") return { ...s, words: [...s.words, ...a.words] };
  if ((a.type === "char" || a.type === "space" || a.type === "tick") && s.startTime !== null && testDuration(s.config) > 0 && elapsed(s, a.now) >= testDuration(s.config)) return finish(s, a.now, true);

  switch (a.type) {
    case "char": {
      const i = s.inputs.length - 1;
      const target = isZen(s) ? s.inputs[i] + a.char : s.words[i];
      if (target === undefined) return s;
      const typed = s.inputs[i];
      if ([...typed].length >= [...target].length + MAX_EXTRA) return s;
      const correct = matches(s, a.char, [...target][[...typed].length] ?? "");
      const inputs = [...s.inputs.slice(0, i), typed + a.char];
      let next: TestState = {
        ...s,
        startTime: s.startTime ?? a.now,
        wordStartTime: s.wordStartTime ?? a.now,
        inputs,
        keys: { correct: s.keys.correct + (correct ? 1 : 0), total: s.keys.total + 1 },
        secondKeys: s.secondKeys + 1,
        secondErrors: s.secondErrors + (correct ? 0 : 1),
      };
      if (!correct && s.config.difficulty === "master") return fail(next, a.now, "master difficulty");
      if (!correct && s.config.stopOnError === "letter") next.inputs = s.inputs;
      if (!correct && s.config.deleteOnError && s.config.deleteOnError !== "off") {
        next.inputs = [...s.inputs.slice(0, i), s.config.deleteOnError.startsWith("word") ? "" : typed];
      }
      next = sample(next, a.now);
      // word-count modes end the moment the last word is typed correctly
      const isLastWord = !isZen(s) && !isContinuousTest(s.config) && i === s.words.length - 1;
      if (isLastWord && (matches(s, next.inputs[i], target) || (s.config.quickEnd && [...next.inputs[i]].length >= [...target].length))) return finish(next, a.now);
      return next;
    }
    case "space": {
      const i = s.inputs.length - 1;
      if (s.inputs[i] === "") return s; // monkeytype ignores leading spaces
      const target = isZen(s) ? s.inputs[i] : s.words[i];
      const correct = matches(s, s.inputs[i], target);
      if (!correct && s.config.difficulty === "expert") return fail(s, a.now, "expert difficulty");
      if (!correct && (s.config.stopOnError === "word" || s.config.stopOnError === "letter" || s.config.strictSpace)) return s;
      let next: TestState = {
        ...s,
        inputs: [...s.inputs, ""],
        wordStartTime: a.now,
        wordDurations: [...s.wordDurations.slice(0, i), a.now - (s.wordStartTime ?? a.now)],
        wordBursts: [...s.wordBursts.slice(0, i), burstWpm([...s.inputs[i]].length, a.now - (s.wordStartTime ?? a.now))],
        keys: { correct: s.keys.correct + (correct ? 1 : 0), total: s.keys.total + 1 },
        secondKeys: s.secondKeys + 1,
        secondErrors: s.secondErrors + (correct ? 0 : 1),
      };
      next = sample(next, a.now);
      if (!isZen(s) && !isContinuousTest(s.config) && i === s.words.length - 1) {
        return finish({ ...next, inputs: s.inputs }, a.now);
      }
      // min burst is judged only when a word is committed with space (never the last word)
      const { minBurst: mode, minBurstCustomSpeed: speed = 0 } = s.config;
      if (mode === "fixed" || mode === "flex") {
        const burst = next.wordBursts[i];
        const limit = mode === "fixed" ? speed : flexBurstThreshold(speed, [...target].length + 1);
        if (burst < limit) return fail(next, a.now, "min burst");
      }
      return next;
    }
    case "backspace": {
      if (s.config.confidenceMode === "max") return s;
      const i = s.inputs.length - 1;
      const typed = s.inputs[i];
      if (typed === "") {
        if (i === 0 || s.config.confidenceMode === "on") return s;
        const prevTarget = isZen(s) ? s.inputs[i - 1] : s.words[i - 1];
        // can only step back into a word that has a mistake
        if (!isZen(s) && !s.config.freedomMode && matches(s, s.inputs[i - 1], prevTarget)) return s;
        const prev = s.inputs[i - 1];
        return { ...s, inputs: [...s.inputs.slice(0, i - 1), a.word ? "" : prev] };
      }
      return { ...s, inputs: [...s.inputs.slice(0, i), a.word ? "" : [...typed].slice(0, -1).join("")] };
    }
    case "tick": {
      const next = sample(s, a.now);
      const secs = elapsed(s, a.now);
      if (secs >= 1) {
        if (s.config.minAcc === "custom" && accuracy(s.keys.correct, s.keys.total) < (s.config.minAccCustom ?? 0)) return fail(next, a.now, "minimum accuracy");
        if (s.config.minWpm === "custom" && s.inputs.length - 1 > 3 && Math.round(wpmFrom(countChars(targetsOf(s), inputsOf(s), false).correctWordChars, secs)) < (s.config.minWpmCustomSpeed ?? 0)) return fail(next, a.now, "min speed");
      }
      if (testDuration(s.config) > 0 && elapsed(s, a.now) >= testDuration(s.config)) return finish(next, a.now, true);
      return next;
    }
    case "finish":
      return finish(s, a.now);
  }
}
