"use client";

import { useEffect, useState } from "react";
import { useTest } from "@/components/TestProvider";
import { Keymap } from "@/components/Keymap";
import { LOCAL_FUNBOXES } from "@/lib/engine-options";
import { Words } from "@/components/Words";
import { Fa } from "@/components/icons";
import { useConfig } from "@/components/ConfigProvider";
import { openCommandline } from "@/lib/commandline-bridge";
import { accuracy, countChars, wpmFrom } from "@/lib/typing";
import { cn } from "@/lib/cn";
import { testNotices } from "@/lib/test-notices";

const TIMER_COLOR = { main: "text-main", sub: "text-sub", text: "text-text", black: "text-[#000000]" } as const;

/** Caps Lock state as last reported by a key event (monkeytype states/modifiers). */
function useCapsLock() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const update = (e: KeyboardEvent) => {
      if (typeof e.getModifierState === "function") setOn(e.getModifierState("CapsLock"));
    };
    window.addEventListener("keydown", update);
    window.addEventListener("keyup", update);
    return () => {
      window.removeEventListener("keydown", update);
      window.removeEventListener("keyup", update);
    };
  }, []);
  return on;
}

export function TypingTest() {
  const { state, counter, focusMode, inputFocused, restart, loadError, paceAverageWpm } = useTest();
  const config = useConfig();
  const capsLock = useCapsLock();
  const seconds = state.lastSecond;
  const targets = state.config.mode === "zen" ? state.inputs : state.words;
  const speed = wpmFrom(countChars(state.config.lazyMode ? targets.map((word) => word.toLocaleLowerCase()) : targets, state.config.lazyMode ? state.inputs.map((word) => word.toLocaleLowerCase()) : state.inputs, false).correctWordChars, seconds);
  const unavailable = config.funbox.filter((name) => !LOCAL_FUNBOXES.includes(name));
  const fade = focusMode && "opacity-0";

  return (
    <div id="typingTest" className="content-grid relative w-full text-[2rem] leading-10">
      {config.capsLockWarning && capsLock && (
        <div className="pointer-events-none absolute -top-10 left-1/2 z-999 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-(--roundness) bg-main p-4 px-8 text-base leading-6 text-bg">
          <Fa icon="lock" />
          Caps Lock
        </div>
      )}
      <div className={cn("flex flex-wrap justify-center gap-x-4 text-base leading-6 text-sub transition-opacity duration-125 select-none", fade)}>
        {testNotices(config, paceAverageWpm, state.isRepeated).map((notice) => {
          const { subgroup } = notice;
          const className = cn(subgroup ? "mt-button" : "inline-flex items-center justify-center rounded-(--roundness) p-[0.5em] leading-[1.25]", "h-full gap-3", notice.error && "text-error");
          const content = <><Fa icon={notice.icon} fw={false} />{notice.text}</>;
          return subgroup ? (
            <button key={subgroup + notice.text} type="button" className={className} onClick={() => openCommandline(subgroup)}>{content}</button>
          ) : (
            <div key={notice.text} className={className}>{content}</div>
          );
        })}
      </div>
      {config.timerStyle === "mini" ? (
        <div className="full-width">
          {/* monkeytype LiveStatsMini: sits on the words' first line, fades with focus */}
          <div className={cn("mt-[-1.25em] flex h-0 w-0 gap-[0.5em] leading-[1em]", TIMER_COLOR[config.timerColor])} style={{ fontSize: `${config.fontSize}rem`, opacity: Number(config.timerOpacity), marginLeft: "0.25em" }}>
            <div className={cn("transition-opacity duration-125", !(counter !== null && focusMode && inputFocused) && "opacity-0")}>{counter}</div>
          </div>
        </div>
      ) : (
        <div className="full-width h-0">
          {counter !== null && config.timerStyle !== "off" && <div className="mt-[-40px] ml-2 flex text-main leading-8">{counter}</div>}
        </div>
      )}
      {loadError ? <div role="alert" className="py-8 text-center text-base text-error">{loadError}. <button onClick={restart} className="mt-button">Retry</button></div> : <Words key={state.resetId} />}
      {state.startTime !== null && <div className="full-width flex justify-center gap-4 text-base text-main" aria-live="off">
        {config.liveSpeedStyle !== "off" && <span>{Math.round(speed)} wpm</span>}
        {config.liveAccStyle !== "off" && <span>{Math.round(accuracy(state.keys.correct, state.keys.total))}% acc</span>}
        {config.liveBurstStyle !== "off" && <span>{state.chart.burst.at(-1) ?? 0} burst</span>}
      </div>}
      <Keymap />
      {unavailable.length > 0 && <div role="status" className="full-width text-center text-xs text-error">Unavailable in this local clone: {unavailable.join(", ")}</div>}
      <button
        type="button"
        aria-label="Restart Test"
        data-balloon-pos="down"
        className={cn("mt-button mx-auto mt-4 w-max px-8 py-4 text-base leading-5 transition-opacity", fade)}
        onClick={restart}
      >
        <Fa icon="redo-alt" />
      </button>
    </div>
  );
}
