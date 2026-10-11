"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import english from "@/data/english.json";
import { initialState, testReducer, type TestState } from "@/lib/test-reducer";
import { CUSTOM_TEXT, DEFAULT_CONFIG, QUOTE_GROUPS, generateWords } from "@/lib/typing";
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
  focusInput: () => void;
  setInputFocused: (focused: boolean) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

const TestContext = createContext<TestContextValue | null>(null);

export function useTest(): TestContextValue {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error("useTest must be used inside <TestProvider>");
  return ctx;
}

let quotesCache: Quote[] | null = null;
async function loadQuotes(): Promise<Quote[]> {
  if (!quotesCache) {
    const res = await fetch("/data/quotes-english.json");
    const json: { quotes: Quote[] } = await res.json();
    quotesCache = json.quotes;
  }
  return quotesCache;
}

async function wordsFor(config: TestConfig): Promise<string[]> {
  switch (config.mode) {
    case "time":
      return generateWords(config, english.words, INITIAL_WORDS);
    case "words":
      return generateWords(config, english.words, config.words);
    case "custom":
      return CUSTOM_TEXT.split(" ");
    case "zen":
      return [];
    case "quote": {
      const quotes = await loadQuotes();
      const pool =
        config.quoteLength === "all"
          ? quotes
          : quotes.filter((q) => {
              const [min, max] = QUOTE_GROUPS[config.quoteLength as Exclude<typeof config.quoteLength, "all">];
              return q.length >= min && q.length <= max;
            });
      return pool[Math.floor(Math.random() * pool.length)].text.split(" ");
    }
  }
}

export function TestProvider({ children }: { children: ReactNode }) {
  // deterministic first render (no random words on the server) → words load on mount
  const [state, dispatch] = useReducer(testReducer, initialState(DEFAULT_CONFIG, []));
  const [focusMode, setFocusMode] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [now, setNow] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const resetSeq = useRef(0);

  const reset = useCallback(async (config: TestConfig) => {
    const seq = ++resetSeq.current;
    const words = await wordsFor(config);
    if (seq !== resetSeq.current) return; // a newer reset won the race
    dispatch({ type: "reset", config, words });
    setFocusMode(false);
  }, []);

  useEffect(() => {
    void reset(DEFAULT_CONFIG);
  }, [reset]);

  const restart = useCallback(() => {
    void reset(state.config);
    inputRef.current?.focus();
  }, [reset, state.config]);

  const setConfig = useCallback(
    (patch: Partial<TestConfig>) => void reset({ ...state.config, ...patch }),
    [reset, state.config],
  );

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
    if (state.config.mode === "time" && state.words.length && remaining < 40) {
      dispatch({ type: "appendWords", words: generateWords(state.config, english.words, 50) });
    }
  }, [remaining, state.config, state.words.length]);

  // focus mode ends on test end or any mouse movement
  useEffect(() => {
    if (state.finished) setFocusMode(false);
  }, [state.finished]);
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

  // "press any key to focus": first key anywhere focuses the hidden input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.finished || e.target === inputRef.current) return;
      if (e.key === "Tab" || e.key === "Enter" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof HTMLElement && e.target.closest("dialog, input, textarea, button, a")) return;
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.finished]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const t = performance.now();
      if (e.key === "Tab") return; // native: moves focus to the restart button
      if (state.config.mode === "zen" && e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "finish", now: t });
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "backspace", word: e.ctrlKey || e.altKey || e.metaKey });
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        dispatch({ type: "space", now: t });
        return;
      }
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      if (state.startTime === null) setNow(t);
      setFocusMode(true);
      dispatch({ type: "char", char: e.key, now: t });
    },
    [state.config.mode, state.startTime],
  );

  const counter = useMemo(() => {
    if (state.startTime === null || state.finished) return null;
    const { mode } = state.config;
    if (mode === "time") {
      const left = state.config.time - Math.floor(Math.max(0, now - state.startTime) / 1000);
      return String(Math.max(0, left));
    }
    if (mode === "zen") return null;
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
    focusInput,
    setInputFocused,
    onKeyDown,
  };
  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}
