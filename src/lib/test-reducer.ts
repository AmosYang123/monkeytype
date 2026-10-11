// Typing-test state machine. Pure: time is passed in, words are passed in.
import type { ChartData, TestConfig, TestResult } from "../types/test.ts";
import { accuracy, consistency, countChars, wpmFrom } from "./typing.ts";

const MAX_EXTRA = 20;

export type TestState = {
  config: TestConfig;
  words: string[];
  /** committed words + the in-progress word (always last, never empty array) */
  inputs: string[];
  startTime: number | null;
  lastSecond: number;
  finished: boolean;
  result: TestResult | null;
  keys: { correct: number; total: number };
  /** keys / errors typed since the last whole-second sample */
  secondKeys: number;
  secondErrors: number;
  chart: ChartData;
};

export type TestAction =
  | { type: "reset"; config: TestConfig; words: string[] }
  | { type: "appendWords"; words: string[] }
  | { type: "char"; char: string; now: number }
  | { type: "space"; now: number }
  | { type: "backspace"; word: boolean }
  | { type: "tick"; now: number }
  | { type: "finish"; now: number };

const emptyChart = (): ChartData => ({ labels: [], wpm: [], raw: [], burst: [], err: [] });

export const initialState = (config: TestConfig, words: string[]): TestState => ({
  config,
  words,
  inputs: [""],
  startTime: null,
  lastSecond: 0,
  finished: false,
  result: null,
  keys: { correct: 0, total: 0 },
  secondKeys: 0,
  secondErrors: 0,
  chart: emptyChart(),
});

const isZen = (s: TestState) => s.config.mode === "zen";
const targetsOf = (s: TestState) => (isZen(s) ? s.inputs : s.words);

const elapsed = (s: TestState, now: number) => (s.startTime === null ? 0 : (now - s.startTime) / 1000);

/** Adds one chart sample per whole second that passed since the last one. */
function sample(s: TestState, now: number, partial = false): TestState {
  const secs = elapsed(s, now);
  const target = partial ? Math.ceil(secs) : Math.floor(secs);
  if (target <= s.lastSecond) return s;
  const counts = countChars(targetsOf(s), s.inputs, false);
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
  return [head, "english", ...(c.punctuation ? ["punctuation"] : []), ...(c.numbers ? ["numbers"] : [])];
}

function finish(s: TestState, now: number): TestState {
  if (s.finished || s.startTime === null) return s;
  const fixedTime = s.config.mode === "time" ? s.config.time : null;
  const end = fixedTime === null ? now : s.startTime + fixedTime * 1000;
  const sampled = sample(s, end, fixedTime === null);
  const secs = fixedTime ?? elapsed(s, now);
  const chars = countChars(targetsOf(sampled), sampled.inputs, true);
  const result: TestResult = {
    wpm: wpmFrom(chars.correctWordChars, secs),
    raw: wpmFrom(chars.allChars, secs),
    acc: accuracy(s.keys.correct, s.keys.total),
    consistency: consistency(sampled.chart.burst),
    chars,
    seconds: secs,
    testType: testType(s.config),
    chart: sampled.chart,
  };
  return { ...sampled, finished: true, result };
}

export function testReducer(s: TestState, a: TestAction): TestState {
  if (a.type === "reset") return initialState(a.config, a.words);
  if (a.type === "appendWords") return { ...s, words: [...s.words, ...a.words] };
  if (s.finished) return s;

  switch (a.type) {
    case "char": {
      const i = s.inputs.length - 1;
      const target = isZen(s) ? s.inputs[i] + a.char : s.words[i];
      const typed = s.inputs[i];
      if (typed.length >= target.length + MAX_EXTRA) return s;
      const correct = target[typed.length] === a.char;
      const inputs = [...s.inputs.slice(0, i), typed + a.char];
      let next: TestState = {
        ...s,
        startTime: s.startTime ?? a.now,
        inputs,
        keys: { correct: s.keys.correct + (correct ? 1 : 0), total: s.keys.total + 1 },
        secondKeys: s.secondKeys + 1,
        secondErrors: s.secondErrors + (correct ? 0 : 1),
      };
      next = sample(next, a.now);
      // word-count modes end the moment the last word is typed correctly
      const isLastWord = !isZen(s) && s.config.mode !== "time" && i === s.words.length - 1;
      if (isLastWord && inputs[i] === target) return finish(next, a.now);
      return next;
    }
    case "space": {
      const i = s.inputs.length - 1;
      if (s.inputs[i] === "") return s; // monkeytype ignores leading spaces
      const target = isZen(s) ? s.inputs[i] : s.words[i];
      const correct = s.inputs[i] === target;
      let next: TestState = {
        ...s,
        inputs: [...s.inputs, ""],
        keys: { correct: s.keys.correct + (correct ? 1 : 0), total: s.keys.total + 1 },
        secondKeys: s.secondKeys + 1,
        secondErrors: s.secondErrors + (correct ? 0 : 1),
      };
      next = sample(next, a.now);
      if (!isZen(s) && s.config.mode !== "time" && i === s.words.length - 1) {
        return finish({ ...next, inputs: s.inputs }, a.now);
      }
      return next;
    }
    case "backspace": {
      const i = s.inputs.length - 1;
      const typed = s.inputs[i];
      if (typed === "") {
        if (i === 0) return s;
        const prevTarget = isZen(s) ? s.inputs[i - 1] : s.words[i - 1];
        // can only step back into a word that has a mistake
        if (!isZen(s) && s.inputs[i - 1] === prevTarget) return s;
        const prev = s.inputs[i - 1];
        return { ...s, inputs: [...s.inputs.slice(0, i - 1), a.word ? "" : prev] };
      }
      return { ...s, inputs: [...s.inputs.slice(0, i), a.word ? "" : typed.slice(0, -1)] };
    }
    case "tick": {
      const next = sample(s, a.now);
      if (s.config.mode === "time" && elapsed(s, a.now) >= s.config.time) return finish(next, a.now);
      return next;
    }
    case "finish":
      return finish(s, a.now);
  }
}
