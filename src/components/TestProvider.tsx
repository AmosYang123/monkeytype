"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname } from "next/navigation";
import { focusTypingOnKey, type TypingKeyEvent } from "@/lib/typing-focus";
import english from "@/data/english.json";
import { getConfig, loadConfig, subscribeConfig, setConfigs } from "@/lib/config/store";
import { transformWords, parseQuotes } from "@/lib/engine-options";
import { engineConfig, customWords } from "@/lib/engine-config";
import { getCustomText, subscribeCustomText } from "@/lib/custom-text";
import { loadLanguage, quoteLanguage } from "@/lib/languages";
import { TEST_STARTED_EVENT, TEST_FINISHED_EVENT, PRACTISE_WORDS_EVENT, emitTestEvent, getSelectedQuoteId, type PractiseWordsDetail } from "@/lib/test-events";
import { initialState, testReducer, testDuration, isContinuousTest, canFinishManually, type TestState } from "@/lib/test-reducer";
import { notify } from "@/lib/notifications";
import { filterOf, getAverage10, saveResult } from "@/lib/results-history";
import { DEFAULT_CONFIG, QUOTE_GROUPS, generateWords } from "@/lib/typing";
import type { Quote, TestConfig } from "@/types/test";

const INITIAL_WORDS = 100;

type TestContextValue = {
  state: TestState;
  /** remaining seconds (time mode) or "typed/total" counter text; null before start */
  counter: string | null;
  focusMode: boolean;
  inputFocused: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  setConfig: (patch: Partial<TestConfig>) => void;
  restart: () => void;
  repeat: () => void;
  loadError: string | null;
  focusInput: () => void;
  setInputFocused: (focused: boolean) => void;
  onKeyDown: (e: TypingKeyEvent) => void;
  /** rounded mean wpm of the 10 newest saved results for the current config; 0 = none */
  paceAverageWpm: number;
  /** wpm for repeatedPace: last finished test, max across consecutive repeats; 0 = none */
  lastTestWpm: number;
};

/** wav variants per pack in public/sounds (packs 8-13 are synthesized) */
const CLICK_VARIANTS: Record<string, number> = { 1: 3, 2: 3, 3: 3, 4: 6, 5: 6, 6: 3, 7: 3, 14: 8, 15: 5, 16: 8 };
const ERROR_VARIANTS: Record<string, number> = { 4: 2 };
const audioPool = new Map<string, HTMLAudioElement[]>();

/** Reuses a few preloaded elements per file instead of allocating an Audio per key. */
function playSound(src: string, volume: number) {
  const pool = audioPool.get(src) ?? [];
  audioPool.set(src, pool);
  let audio = pool.find((a) => a.paused || a.ended);
  if (!audio && pool.length < 4) { audio = new Audio(src); pool.push(audio); }
  audio ??= pool[0];
  audio.currentTime = 0;
  audio.volume = Math.min(1, Math.max(0, volume));
  void audio.play().catch(() => {});
}



const TestContext = createContext<TestContextValue | null>(null);

export function useTest(): TestContextValue {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error("useTest must be used inside <TestProvider>");
  return ctx;
}

const quotesCache = new Map<string, Quote[]>();
async function loadQuotes(language: string): Promise<Quote[]> {
  const base = quoteLanguage(language);
  const cached = quotesCache.get(base);
  if (cached) return cached;
  const res = await fetch(`/quotes/${base}.json`);
  if (!res.ok) throw new Error(`Quotes unavailable for ${base}`);
  const quotes = parseQuotes(await res.json());
  quotesCache.set(base, quotes);
  return quotes;
}

async function wordsFor(config: TestConfig): Promise<string[]> {
  switch (config.mode) {
    case "time":
      return generateWords(config, (await loadLanguage(config.language ?? "english")).words, INITIAL_WORDS);
    case "words":
      return generateWords(config, (await loadLanguage(config.language ?? "english")).words, config.words || INITIAL_WORDS);
    case "custom":
      return customWords(getCustomText());
    case "zen":
      return [];
    case "quote": {
      const quotes = await loadQuotes(config.language ?? "english");
      const selected = getConfig().quoteLength.includes(-2) ? quotes.find((q) => q.id === getSelectedQuoteId()) : undefined;
      if (selected) return selected.text.split(/\s+/);
      const lengths = ["short", "medium", "long", "thicc"] as const;
      const groups = getConfig().quoteLength;
      const pool = groups.some((group) => group < 0) ? quotes : quotes.filter((quote) => groups.some((group) => {
        const length = lengths.find((_, index) => index === group);
        const bounds = length ? QUOTE_GROUPS[length] : undefined;
        return bounds && quote.length >= bounds[0] && quote.length <= bounds[1];
      }));
      return (pool[Math.floor(Math.random() * pool.length)] ?? quotes[0]).text.split(/\s+/);
    }
  }
}

export function TestProvider({ children }: { children: ReactNode }) {
  // deterministic first render (no random words on the server) → words load on mount
  const [state, dispatch] = useReducer(testReducer, initialState(DEFAULT_CONFIG, []));
  const [typingFocus, setFocusMode] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [now, setNow] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const onTestPage = usePathname() === "/";
  const resetSeq = useRef(0);
  const focusAfterReset = useRef(false);
  const emittedStart = useRef(-1);
  const emittedFinish = useRef(-1);
  const [paceAverageWpm, setPaceAverageWpm] = useState(0);
  const [lastTestWpm, setLastTestWpm] = useState(0);

  useLayoutEffect(() => {
    if (!focusAfterReset.current) return;
    focusAfterReset.current = false;
    inputRef.current?.focus();
  }, [state.resetId]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const wordlist = useRef(english.words);

  const reset = useCallback(async (config: TestConfig) => {
    const seq = ++resetSeq.current;
    let words: string[];
    try {
      words = transformWords(await wordsFor(config), getConfig().funbox);
      const nextWordlist = config.mode === "time" || config.mode === "words" ? (await loadLanguage(config.language ?? "english")).words : null;
      if (seq !== resetSeq.current) return;
      if (nextWordlist) wordlist.current = nextWordlist;
      setLoadError(null);
    } catch (error) {
      if (seq !== resetSeq.current) return;
      setLoadError(error instanceof Error ? error.message : "Unable to load test");
      words = [];
    }
    if (config.mode === "custom") {
      const custom = getCustomText();
      if (custom.limit.mode === "time" || custom.limit.mode === "word" && custom.limit.value === 0) config = { ...config, duration: custom.limit.mode === "time" ? custom.limit.value : 0 };
    }
    if (seq !== resetSeq.current) return; // a newer reset won the race
    dispatch({ type: "reset", config, words });
    setFocusMode(false);
  }, []);

  useEffect(() => {
    loadConfig();
    queueMicrotask(() => void reset(engineConfig(getConfig())));
    const unsubscribe = subscribeConfig((changed) => {
      const config = engineConfig(getConfig());
      if (changed.some((key) => ["mode", "time", "words", "quoteLength", "language", "punctuation", "numbers", "difficulty", "freedomMode", "confidenceMode", "stopOnError", "deleteOnError", "strictSpace", "quickEnd", "lazyMode", "minWpm", "minWpmCustomSpeed", "minAcc", "minAccCustom", "minBurst", "minBurstCustomSpeed", "funbox"].includes(key))) void reset(config);
    });
    const unsubscribeCustom = subscribeCustomText(() => {
      if (getConfig().mode === "custom") void reset(engineConfig(getConfig()));
    });
    return () => { unsubscribe(); unsubscribeCustom(); };
  }, [reset]);

  const restart = useCallback(() => {
    focusAfterReset.current = true;
    void reset(engineConfig(getConfig()));
    inputRef.current?.focus();
  }, [reset]);

  const setConfig = useCallback((patch: Partial<TestConfig>) => {
    const { quoteLength, ...rest } = patch;
    const lengths = ["short", "medium", "long", "thicc"];
    setConfigs({ ...rest, ...(quoteLength ? { quoteLength: [quoteLength === "all" ? -3 : lengths.indexOf(quoteLength) as 0 | 1 | 2 | 3] } : {}) });
  }, []);

  const repeat = useCallback(() => {
    ++resetSeq.current;
    focusAfterReset.current = true;
    dispatch({ type: "reset", config: state.config, words: state.words, repeated: true });
    setFocusMode(false); // header/config/footer stay visible until the user types again
    inputRef.current?.focus();
  }, [state.config, state.words]);

  useEffect(() => {
    queueMicrotask(() => setPaceAverageWpm(getAverage10(filterOf(state.config))));
  }, [state.config]);

  useEffect(() => {
    if (state.startTime !== null && emittedStart.current !== state.resetId) {
      emittedStart.current = state.resetId;
      emitTestEvent(TEST_STARTED_EVENT);
    }
    if (state.finished && emittedFinish.current !== state.resetId) {
      emittedFinish.current = state.resetId;
      emitTestEvent(TEST_FINISHED_EVENT, { failed: Boolean(state.result?.failed), failReason: state.result?.failReason });
      const result = state.result;
      if (result?.failed) {
        if (result.failReason === "min speed" || result.failReason === "min burst") notify(`Test failed - ${result.failReason}`, { level: "notice", durationMs: 1000 });
      } else if (result) {
        // upstream: an afk test is invalid and not saved
        if (result.afkDetected) notify("Test invalid - AFK detected", { level: "notice" });
        else saveResult(state.config, result.wpm, result.acc);
        queueMicrotask(() => {
          setPaceAverageWpm(getAverage10(filterOf(state.config)));
          setLastTestWpm((last) => (!result.isRepeated || result.wpm > last ? result.wpm : last));
        });
      }
    }
  }, [state.resetId, state.startTime, state.finished, state.result, state.config]);

  useEffect(() => {
    const practise = (event: Event) => {
      const detail = (event as CustomEvent<PractiseWordsDetail>).detail;
      const missed = state.words.filter((word, i) => state.inputs[i] !== undefined && (state.config.lazyMode ? state.inputs[i].toLocaleLowerCase() !== word.toLocaleLowerCase() : state.inputs[i] !== word));
      const rates = state.wordDurations.map((duration, i) => duration / Math.max(1, [...(state.words[i] ?? "")].length));
      const average = rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0;
      const slow = detail.slow ? state.words.filter((_, i) => rates[i] > average) : [];
      const words = [...new Set([...(detail.missed === "off" ? detail.slow ? [] : state.words.slice(0, state.inputs.length) : missed), ...slow])];
      if (!words.length) return;
      const targets = detail.missed === "biwords" ? words.flatMap((word) => [word, word]) : words;
      ++resetSeq.current;
      focusAfterReset.current = true;
      dispatch({ type: "reset", config: { ...state.config, mode: "words", duration: undefined, words: targets.length }, words: targets });
      setFocusMode(false); // header/config/footer stay visible until the user types again
      inputRef.current?.focus();
    };
    window.addEventListener(PRACTISE_WORDS_EVENT, practise);
    return () => window.removeEventListener(PRACTISE_WORDS_EVENT, practise);
  }, [state.words, state.inputs, state.config, state.wordDurations]);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  // 1s ticks while running: drives the countdown and the chart samples
  const running = state.startTime !== null && !state.finished;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const t = performance.now();
      setNow(t);
      dispatch({ type: "tick", now: t });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // time mode never runs out of words
  const remaining = state.words.length - state.inputs.length;
  useEffect(() => {
    if (!state.finished && isContinuousTest(state.config) && state.words.length && remaining < 40) {
      dispatch({ type: "appendWords", words: transformWords(getConfig().mode === "custom" ? customWords(getCustomText()) : generateWords(state.config, wordlist.current, 50), getConfig().funbox) });
    }
  }, [remaining, state.config, state.words.length, state.finished]);

  // focus mode ends on test end or any mouse movement
  const focusMode = typingFocus && !state.finished;
  useEffect(() => {
    if (!focusMode) return;
    document.body.classList.add("focus-mode");
    const exit = () => setFocusMode(false);
    window.addEventListener("mousemove", exit, { once: true });
    return () => {
      document.body.classList.remove("focus-mode");
      window.removeEventListener("mousemove", exit);
    };
  }, [focusMode]);

  const onKeyDown = useCallback(
    (e: TypingKeyEvent) => {
      const t = performance.now();
      if (e.key === "Enter" && e.shiftKey && canFinishManually(state.config)) {
        e.preventDefault();
        dispatch({ type: "finish", now: t });
        return;
      }
      const soundConfig = getConfig();
      const target = state.words[state.inputs.length - 1];
      const error = [...e.key].length === 1 && e.key !== " " && target !== undefined && (state.config.lazyMode ? [...target][[...(state.inputs.at(-1) ?? "")].length]?.toLocaleLowerCase() !== e.key.toLocaleLowerCase() : [...target][[...(state.inputs.at(-1) ?? "")].length] !== e.key);
      const tone = Number(soundConfig.playSoundOnClick);
      if (!error && tone >= 8 && tone <= 13 && [...e.key].length === 1) {
        try {
          const context = audioContext.current ?? new AudioContext();
          audioContext.current = context;
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = tone % 2 ? "sine" : "square";
          oscillator.frequency.value = 200 + tone * 50;
          gain.gain.setValueAtTime(soundConfig.soundVolume * 0.1, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.04);
          oscillator.connect(gain); gain.connect(context.destination);
          oscillator.start(); oscillator.stop(context.currentTime + 0.05);
        } catch { /* browser audio unavailable */ }
      }
      const variant = (count = 1) => 1 + Math.floor(Math.random() * count);
      const sound = error && soundConfig.playSoundOnError !== "off" ? `/sounds/error${soundConfig.playSoundOnError}/${variant(ERROR_VARIANTS[soundConfig.playSoundOnError])}.wav`
        : soundConfig.playSoundOnClick !== "off" && !(tone >= 8 && tone <= 13) ? `/sounds/click${soundConfig.playSoundOnClick}/${variant(CLICK_VARIANTS[soundConfig.playSoundOnClick] ?? 10)}.wav` : null;
      if (sound && ([...e.key].length === 1 || e.key === "Backspace")) playSound(sound, soundConfig.soundVolume);
      const quickRestart = getConfig().funbox.includes("no_quit") && state.startTime !== null && !state.finished ? "off" : getConfig().quickRestart;
      if ((quickRestart === "tab" && e.key === "Tab") || (quickRestart === "enter" && e.key === "Enter") || (quickRestart === "esc" && e.key === "Escape")) {
        e.preventDefault(); restart(); return;
      }
      if (e.key === "Tab") return; // native: moves focus to the restart button
      if (e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "backspace", word: e.ctrlKey || e.altKey || e.metaKey, now: t });
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        dispatch({ type: "space", now: t });
        return;
      }
      if ([...e.key].length !== 1 || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      if (state.startTime === null) setNow(t);
      setFocusMode(true);
      dispatch({ type: "char", char: e.key, now: t });
    },
    [restart, state.config, state.startTime, state.words, state.inputs, state.finished],
  );

  // "press any key to focus": first key anywhere focuses the hidden input
  useEffect(() => {
    if (!onTestPage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target !== inputRef.current && !(e.target instanceof HTMLElement && e.target.closest("dialog, input, textarea"))) {
        const quick = getConfig().quickRestart;
        if ((quick === "esc" && e.key === "Escape") || (quick === "tab" && e.key === "Tab") || (quick === "enter" && e.key === "Enter")) {
          onKeyDown(e);
          return;
        }
      }
      const blocked = state.finished || e.target === inputRef.current ||
        e.target instanceof HTMLElement && Boolean(e.target.closest("dialog, input, textarea, button, a"));
      focusTypingOnKey(e, blocked, focusInput, onKeyDown);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onTestPage, state.finished, focusInput, onKeyDown]);

  const counter = useMemo(() => {
    if (state.startTime === null || state.finished) return null;
    const { mode } = state.config;
    if (testDuration(state.config) > 0) {
      const left = testDuration(state.config) - Math.floor(Math.max(0, now - state.startTime) / 1000);
      return String(Math.max(0, left));
    }
    if (mode === "zen") return null;
    if (isContinuousTest(state.config)) return String(state.inputs.length - 1);
    return `${state.inputs.length - 1}/${state.words.length}`;
  }, [now, state.config, state.finished, state.inputs.length, state.startTime, state.words.length]);

  const value: TestContextValue = {
    state,
    counter,
    focusMode,
    inputFocused,
    inputRef,
    setConfig,
    restart,
    repeat,
    loadError,
    focusInput,
    setInputFocused,
    onKeyDown,
    paceAverageWpm,
    lastTestWpm,
  };
  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}
