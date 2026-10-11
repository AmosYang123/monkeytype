"use client";

import { useTest } from "@/components/TestProvider";
import { Words } from "@/components/Words";
import { Fa } from "@/components/icons";
import { cn } from "@/lib/cn";

export function TypingTest() {
  const { state, counter, focusMode, restart } = useTest();
  const fade = focusMode && "opacity-0";

  return (
    <div id="typingTest" className="content-grid relative w-full text-[2rem] leading-10">
      <div className={cn("flex flex-wrap justify-center gap-x-4 text-base leading-6 text-sub transition-opacity duration-125 select-none", fade)}>
        <button type="button" className="mt-button h-full gap-3">
          <Fa icon="globe-americas" fw={false} />
          english
        </button>
      </div>
      <div className="full-width h-0">
        {counter !== null && <div className="mt-[-40px] ml-2 flex text-main leading-8">{counter}</div>}
      </div>
      <Words key={state.resetId} />
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
