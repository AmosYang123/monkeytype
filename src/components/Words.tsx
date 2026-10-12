"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { useTest } from "@/components/TestProvider";
import { Fa } from "@/components/icons";
import { useConfig } from "@/components/ConfigProvider";
import { cn } from "@/lib/cn";
import { letterStates } from "@/lib/typing";
import { CARET_EASING, LINE_SCROLL_EASING, LINE_SCROLL_MS, caretDuration } from "@/lib/caret-motion";
import { joinOverlappingHints, type Hint } from "@/lib/typo-hints";
import { commitPaceWord, initialPace, paceCaretWpm, secondsPerChar, stepPace, type PaceState } from "@/lib/pace-caret";
import type { CaretStyle } from "@/lib/config/types";

/** monkeytype shows the out-of-focus warning (and blurs) only after 1s unfocused */
const OUT_OF_FOCUS_DELAY_MS = 1000;

/** Fills each word's empty `.hints` box with positioned <hint>s (monkeytype createHintsHtml + joinOverlappingHints). */
function renderHints(box: HTMLElement) {
  const letters = [...(box.parentElement?.querySelectorAll<HTMLElement>(".letter") ?? [])].map((el) => ({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth }));
  const chars = [...(box.dataset.chars ?? "")];
  const make = (hint: Pick<Hint, "text" | "left">) => {
    const el = document.createElement("hint");
    el.textContent = hint.text;
    el.style.left = `${hint.left}px`;
    return el;
  };
  const width = (text: string) => {
    const el = box.appendChild(make({ text, left: 0 }));
    const w = el.offsetWidth;
    el.remove();
    return w;
  };
  const hints = (box.dataset.indices ?? "").split(",").map(Number).flatMap((i, k) => {
    const letter = letters[i];
    return letter && chars[k] !== undefined ? [{ indices: [i], text: chars[k], left: letter.left + letter.width / 2 }] : [];
  });
  box.replaceChildren(...joinOverlappingHints(hints, letters, width).map(make));
}

const caretGlyph = (style: CaretStyle) => (style === "banana" ? "🍌" : style === "carrot" ? "🥕" : style === "monkey" ? "🐒" : null);

/** Shape of the main and pace carets: `fill` is the background, `line` the outline border. */
function caretShape(style: CaretStyle, fill: string, line: string): CSSProperties {
  const bare = style === "outline" || style === "banana" || style === "carrot" || style === "monkey";
  return {
    width: style === "block" || style === "outline" ? "0.6em" : style === "underline" ? "0.5em" : undefined,
    background: bare ? "transparent" : fill,
    border: style === "outline" ? `0.05em solid ${line}` : undefined,
    height: style === "underline" ? "0.1em" : undefined,
  };
}

/** Words wrapper: hidden input, focus overlay, caret, and the 3-line words view. */
export function Words() {
  const { state, inputFocused, focusMode, inputRef, onKeyDown, setInputFocused, focusInput, paceAverageWpm, lastTestWpm } = useTest();
  const config = useConfig();
  const [firstVisible, setFirstVisible] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const paceRef = useRef<HTMLDivElement>(null);
  const paceAnim = useRef<Animation>(undefined);
  const paceState = useRef<PaceState>(initialPace);
  const paceStarted = useRef(false);
  const committed = useRef(state.inputs.length);
  const caretRef = useRef<HTMLDivElement>(null);
  const caretAnim = useRef<Animation>(undefined);
  const caretInputs = useRef<readonly string[]>(undefined);
  const lineScroll = useRef<Animation[]>(undefined);
  const [outOfFocus, setOutOfFocus] = useState(false);

  const zen = state.config.mode === "zen";
  const targets = zen ? state.inputs : state.words;
  const active = state.inputs.length - 1;
  const showOutOfFocus = outOfFocus && !inputFocused && config.showOutOfFocusWarning;

  // refocus hides the warning at once; losing focus shows it after a delay
  useEffect(() => {
    if (inputFocused) return;
    const timer = setTimeout(() => setOutOfFocus(true), OUT_OF_FOCUS_DELAY_MS);
    return () => {
      clearTimeout(timer);
      setOutOfFocus(false);
    };
  }, [inputFocused]);
  useEffect(() => () => lineScroll.current?.forEach((anim) => anim.cancel()), []);
  useLayoutEffect(() => {
    wordsRef.current?.querySelectorAll<HTMLElement>(".hints").forEach(renderHints);
  });

  // page load and every restart/repeat/practice remount Words: focus the input unless a dialog or other field has focus
  useEffect(() => {
    const current = document.activeElement;
    const taken = document.querySelector("dialog[open]") !== null || (current instanceof HTMLElement && current !== inputRef.current && current.matches("input, textarea, select, [contenteditable]"));
    if (!taken) inputRef.current?.focus({ preventScroll: true });
  }, [inputRef]);
  // typo hints depend on letter metrics: re-measure on resize and once web fonts have loaded
  useEffect(() => {
    const remeasure = () => wordsRef.current?.querySelectorAll<HTMLElement>(".hints").forEach(renderHints);
    window.addEventListener("resize", remeasure);
    document.fonts?.addEventListener("loadingdone", remeasure);
    void document.fonts?.ready.then(remeasure);
    return () => {
      window.removeEventListener("resize", remeasure);
      document.fonts?.removeEventListener("loadingdone", remeasure);
    };
  }, []);

  // pace caret (monkeytype test/pace-caret.ts): one linear glide per char, steps scheduled against the absolute start time
  const wpm = paceCaretWpm({ ...config, averageWpm: paceAverageWpm, lastWpm: lastTestWpm, isRepeated: state.isRepeated });
  const paceOn = wpm > 0 && config.paceCaretStyle !== "off" && !zen;
  const paceShape = caretShape(config.paceCaretStyle, "var(--sub-color)", "var(--sub-color)");
  const targetsRef = useRef(targets);
  useLayoutEffect(() => {
    targetsRef.current = targets;
  });
  const placePace = useCallback((duration: number) => {
    const caret = paceRef.current;
    const wrapper = wrapperRef.current;
    const container = wordsRef.current;
    if (!caret || !wrapper || !container || !paceStarted.current) return;
    const { wordIndex, letterIndex } = paceState.current;
    const word = container.querySelector<HTMLElement>(`[data-index="${wordIndex}"]`);
    if (!word) {
      caret.style.visibility = "hidden"; // past the last word, or scrolled out with its line
      return;
    }
    const letters = word.querySelectorAll<HTMLElement>(".letter");
    const target = letters[Math.min(letterIndex, letters.length - 1)];
    const rect = (target ?? word).getBoundingClientRect();
    const x = letterIndex >= letters.length && target ? rect.right : rect.left;
    const base = wrapper.getBoundingClientRect();
    const scrollOffset = parseFloat(getComputedStyle(container).marginTop) || 0;
    const left = `${x - base.left - caret.offsetWidth / 2}px`;
    const top = `${rect.top - base.top - scrollOffset + (rect.height - caret.offsetHeight) / 2}px`;
    const style = getComputedStyle(caret);
    const from = { left: style.left, top: style.top };
    paceAnim.current?.cancel();
    caret.style.left = left;
    caret.style.top = top;
    caret.style.visibility = "visible";
    if (duration > 0) paceAnim.current = caret.animate([from, { left, top }], { duration, easing: "linear" });
  }, []);
  useEffect(() => {
    if (!paceOn || state.startTime === null || state.finished) return;
    const startTime = state.startTime;
    const stepMs = secondsPerChar(wpm) * 1000;
    let timer: ReturnType<typeof setTimeout> | undefined;
    paceState.current = initialPace;
    paceStarted.current = true;
    placePace(0);
    const step = (end: number) => {
      const next = stepPace(targetsRef.current, paceState.current, config.blindMode);
      if (!next) {
        if (paceRef.current) paceRef.current.style.visibility = "hidden"; // out of words
        return;
      }
      paceState.current = next;
      const duration = Math.max(0, startTime + end - performance.now());
      placePace(duration);
      timer = setTimeout(() => step(end + stepMs), duration);
    };
    step(stepMs);
    return () => clearTimeout(timer);
  }, [paceOn, wpm, state.startTime, state.finished, config.blindMode, placePace]);
  // a word committed with space: wrong ones push the pace caret ahead, fixing one pulls it back
  useEffect(() => {
    const count = state.inputs.length;
    if (count > committed.current && count >= 2) {
      const target = targets[count - 2];
      const typed = state.inputs[count - 2];
      if (target !== undefined) {
        const correct = state.config.lazyMode ? typed.toLocaleLowerCase() === target.toLocaleLowerCase() : typed === target;
        paceState.current = commitPaceWord(paceState.current, count - 2, [...target].length, correct, config.blindMode);
      }
    }
    committed.current = count;
  }, [state.inputs, targets, state.config.lazyMode, config.blindMode]);
  // layout changes (line dropped, font size, tape scroll) re-place the caret without gliding
  const tapeActive = config.tapeMode === "off" ? -1 : active;
  useLayoutEffect(() => {
    placePace(0);
  }, [placePace, firstVisible, config.fontSize, config.showAllLines, tapeActive]);
  // line scrolling: once the active word reaches line 3, drop line 1
  useLayoutEffect(() => {
    if (config.showAllLines || lineScroll.current) return;
    const container = wordsRef.current;
    const first = container?.firstElementChild as HTMLElement | null;
    const activeEl = container?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!container || !first || !activeEl) return;
    const wordEls = [...container.children] as HTMLElement[];
    const secondLine = wordEls.find((el) => el.offsetTop > first.offsetTop);
    if (!secondLine) return;
    // offsetTop rounds (lines are 51.5px apart), so compare against half a line past line 2
    const lineStep = secondLine.offsetTop - first.offsetTop;
    if (activeEl.offsetTop > secondLine.offsetTop + lineStep / 2) {
      const next = Number(secondLine.dataset.index);
      if (!config.smoothLineScroll) {
        // DOM measurement drives this state, which is what layout effects are for
        setFirstVisible(next);
        return;
      }
      // smoothLineScroll: slide words + caret up a line, then drop the line and reset in one task (no paint between)
      const slide = [{ marginTop: "0px" }, { marginTop: `${-lineStep}px` }];
      const timing: KeyframeAnimationOptions = { duration: LINE_SCROLL_MS, easing: LINE_SCROLL_EASING, fill: "forwards" };
      const anims = [container.animate(slide, timing), ...[caretRef.current, paceRef.current].flatMap((el) => (el ? [el.animate(slide, timing)] : []))];
      lineScroll.current = anims;
      anims[0].onfinish = () => {
        anims.forEach((anim) => anim.cancel());
        lineScroll.current = undefined;
        flushSync(() => setFirstVisible(next));
      };
    }
  }, [active, firstVisible, state.inputs, config.showAllLines, config.fontSize, config.tapeMode, config.tapeMargin, config.funbox, config.smoothLineScroll]);

  // caret follows the next letter to type; stops blinking while keys come in
  useLayoutEffect(() => {
    const caret = caretRef.current;
    const wrapper = wrapperRef.current;
    const word = wordsRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!caret || !wrapper || !word) return;
    if (wordsRef.current) {
      const effect = config.funbox.includes("mirror") ? "scaleX(-1)" : config.funbox.includes("upside_down") ? "rotate(180deg)" : "";
      const offset = config.tapeMode === "off" ? "" : `translateX(${-Math.max(0, word.offsetLeft - wrapper.clientWidth * config.tapeMargin / 100)}px)`;
      wordsRef.current.style.transform = `${offset} ${effect}`.trim();
    }
    const letters = word.querySelectorAll<HTMLElement>(".letter");
    const typed = [...state.inputs[active]].length;
    const base = wrapper.getBoundingClientRect();
    const target = letters[Math.min(typed, letters.length - 1)];
    const rect = (target ?? word).getBoundingClientRect();
    const x = typed >= letters.length && target ? rect.right : rect.left;
    // a running line scroll offsets #words; the caret runs the same margin animation itself
    const scrollOffset = parseFloat(getComputedStyle(wordsRef.current ?? word).marginTop) || 0;
    const left = `${x - base.left - caret.offsetWidth / 2}px`;
    const top = `${rect.top - base.top - scrollOffset + (rect.height - caret.offsetHeight) / 2}px`;
    // glide only for typing; first placement, line drops and layout changes snap (monkeytype noAnim)
    const duration = caretInputs.current !== undefined && caretInputs.current !== state.inputs ? caretDuration(config.smoothCaret) : 0;
    caretInputs.current = state.inputs;
    const style = getComputedStyle(caret);
    const from = { left: style.left, top: style.top };
    caretAnim.current?.cancel();
    caret.style.left = left;
    caret.style.top = top;
    if (duration > 0) caretAnim.current = caret.animate([from, { left, top }], { duration, easing: CARET_EASING });
  }, [active, firstVisible, state.inputs, config.showAllLines, config.fontSize, config.tapeMode, config.tapeMargin, config.funbox, config.smoothCaret]);

  return (
    <div id="wordsWrapper" ref={wrapperRef} className="full-width relative overflow-x-visible overflow-y-clip" style={{ height: config.showAllLines ? "auto" : `${config.fontSize * 4.875}rem`, fontSize: `${config.fontSize}rem` }} translate="no">
      <textarea
        id="wordsInput"
        ref={inputRef}
        className="absolute top-[9px] left-[10px] -z-10 h-8 w-[38px] resize-none overflow-hidden bg-sub-alt opacity-0"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        data-gramm="false"
        aria-label="typing input"
        onKeyDown={onKeyDown}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        defaultValue=" "
      />
      {showOutOfFocus && (
        <div
          className="absolute inset-0 z-[999] flex cursor-default items-center justify-center gap-2 text-base leading-6 text-text select-none"
          onClick={focusInput}
        >
          <Fa icon="mouse-pointer" className="leading-4" />
          <div>Click here or press any key to focus</div>
        </div>
      )}
      {paceOn && <div id="paceCaret" ref={paceRef} className="pointer-events-none absolute z-10 w-[0.1em] origin-top-left rounded-(--roundness) opacity-50" style={{ left: 8.5, top: 6, visibility: "hidden", ...paceShape, height: paceShape.height ?? "1.2em" }} aria-hidden="true">{caretGlyph(config.paceCaretStyle)}</div>}
      <div id="caret" ref={caretRef} className={cn((!inputFocused || config.caretStyle === "off") && "invisible", config.smoothCaret === "off" && "hard", focusMode && "typing")} style={{ left: 8.5, top: 6, ...caretShape(config.caretStyle, "var(--caret-color)", "var(--main-color)") }}>{caretGlyph(config.caretStyle)}</div>
      <div id="words" ref={wordsRef} className={cn(showOutOfFocus && "blurred")} style={{ fontSize: "inherit", lineHeight: "1.6em", flexWrap: config.tapeMode !== "off" ? "nowrap" : undefined, transform: config.funbox.includes("mirror") ? "scaleX(-1)" : config.funbox.includes("upside_down") ? "rotate(180deg)" : undefined }} onClick={focusInput}>
        {targets.slice(firstVisible).map((target, k) => {
          const i = k + firstVisible;
          const typed = i <= active ? state.inputs[i] : undefined;
          const ahead = config.funbox.includes("read_ahead_hard") ? 3 : config.funbox.includes("read_ahead") ? 2 : config.funbox.includes("read_ahead_easy") ? 1 : 0;
          const hidden = (ahead > 0 && state.startTime !== null && i <= active + ahead - 1) || (config.funbox.includes("memory") && state.startTime !== null);
          const highlight = config.highlightMode === "word" && i === active || config.highlightMode === "next_word" && i === active + 1 || config.highlightMode === "next_two_words" && i > active && i <= active + 2 || config.highlightMode === "next_three_words" && i > active && i <= active + 3;
          const error = i < active && (state.config.lazyMode ? typed?.toLocaleLowerCase() !== target.toLocaleLowerCase() : typed !== target);
          const letters = letterStates(target, typed, state.config.lazyMode);
          const typedChars = [...(typed ?? "")];
          // indicateTypos (monkeytype test-ui): replace/both show the typed char; below/both add hints under the letter
          const showTyped = config.indicateTypos === "replace" || config.indicateTypos === "both";
          const wrong = config.blindMode || (config.indicateTypos !== "below" && config.indicateTypos !== "both") ? [] : letters.flatMap((l, j) => (l.state === "incorrect" ? [j] : []));
          return (
            <div key={i} data-index={i} className={cn("word", error && !config.blindMode && "error")} style={{ color: highlight ? "var(--text-color)" : undefined, visibility: hidden ? "hidden" : undefined, textShadow: config.funbox.includes("crt") ? "0 0 5px currentColor" : undefined, opacity: i < active && config.typedEffect === "fade" ? 0.3 : i < active && config.typedEffect === "hide" ? 0 : undefined }}>
              {letters.map((l, j) => (
                <span key={j} className={cn("letter", config.blindMode && (l.state === "incorrect" || l.state === "extra") ? "correct" : l.state)} style={{ display: config.hideExtraLetters && l.state === "extra" ? "none" : undefined }}>
                  {i < active && config.typedEffect === "dots" ? "·" : showTyped && l.state === "incorrect" ? typedChars[j] : l.char}
                </span>
              ))}
              {wrong.length > 0 && <div className="hints" data-indices={wrong.join(",")} data-chars={wrong.map((j) => (config.indicateTypos === "both" ? letters[j].char : typedChars[j])).join("")} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
