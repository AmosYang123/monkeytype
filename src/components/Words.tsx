"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useTest } from "@/components/TestProvider";
import { Fa } from "@/components/icons";
import { cn } from "@/lib/cn";
import { letterStates } from "@/lib/typing";

const CARET_TYPING_MS = 1000;

/** Words wrapper: hidden input, focus overlay, caret, and the 3-line words view. */
export function Words() {
  const { state, inputFocused, inputRef, onKeyDown, setInputFocused, focusInput } = useTest();
  const [firstVisible, setFirstVisible] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const zen = state.config.mode === "zen";
  const targets = zen ? state.inputs : state.words;
  const active = state.inputs.length - 1;

  // line scrolling: once the active word reaches line 3, drop line 1
  useLayoutEffect(() => {
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
      // DOM measurement drives this state, which is what layout effects are for
      setFirstVisible(Number(secondLine.dataset.index));
    }
  }, [active, firstVisible, state.inputs]);

  // caret follows the next letter to type; stops blinking while keys come in
  useLayoutEffect(() => {
    const caret = caretRef.current;
    const wrapper = wrapperRef.current;
    const word = wordsRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!caret || !wrapper || !word) return;
    const letters = word.querySelectorAll<HTMLElement>(".letter");
    const typed = state.inputs[active].length;
    const base = wrapper.getBoundingClientRect();
    const target = letters[Math.min(typed, letters.length - 1)];
    const rect = (target ?? word).getBoundingClientRect();
    const x = typed >= letters.length && target ? rect.right : rect.left;
    caret.style.left = `${x - base.left - caret.offsetWidth / 2}px`;
    caret.style.top = `${rect.top - base.top + (rect.height - caret.offsetHeight) / 2}px`;
  }, [active, firstVisible, state.inputs]);

  useLayoutEffect(() => {
    const caret = caretRef.current;
    if (!caret || state.startTime === null) return;
    caret.classList.add("typing");
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => caret.classList.remove("typing"), CARET_TYPING_MS);
  }, [state.inputs, state.startTime]);

  return (
    <div id="wordsWrapper" ref={wrapperRef} className="full-width relative h-[156px] overflow-x-visible overflow-y-clip" translate="no">
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
      {!inputFocused && (
        <div
          className="absolute inset-0 z-[999] flex cursor-default items-center justify-center gap-2 text-base leading-6 text-text"
          onClick={focusInput}
        >
          <Fa icon="mouse-pointer" className="leading-4" />
          <div>Click here or press any key to focus</div>
        </div>
      )}
      <div id="caret" ref={caretRef} className={cn(!inputFocused && "hidden")} style={{ left: 8.5, top: 6 }} />
      <div id="words" ref={wordsRef} className={cn(!inputFocused && "blurred")} onClick={focusInput}>
        {targets.slice(firstVisible).map((target, k) => {
          const i = k + firstVisible;
          const typed = i <= active ? state.inputs[i] : undefined;
          const error = i < active && typed !== target;
          return (
            <div key={i} data-index={i} className={cn("word", error && "error")}>
              {letterStates(target, typed).map((l, j) => (
                <span key={j} className={cn("letter", l.state)}>
                  {l.char}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
