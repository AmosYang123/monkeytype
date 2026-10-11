"use client";

import { Fa } from "@/components/icons";
import { subTitle, titleText, type Selection } from "./data";

export function Title({ selection, now, onTogglePrevious }: { selection: Selection; now: number; onTogglePrevious: () => void }) {
  const sub = subTitle(selection, now);
  return (
    <div>
      <h2 className="flex place-items-center gap-[0.5em] p-0 text-2xl font-normal text-text md:text-3xl xl:text-4xl">{titleText(selection)}</h2>
      {sub && (
        <div className="flex items-center gap-2">
          <div className="text-sub" data-balloon-pos="down" data-balloon-break="" aria-label={sub.localString}>
            {sub.dateString}
          </div>
          <div className="h-[1.75em] w-[0.25em] rounded bg-sub-alt" />
          <button type="button" className="mt-button" onClick={onTogglePrevious}>
            <Fa icon={selection.previous ? "forward" : "backward"} variant="solid" />
            {sub.buttonText}
          </button>
        </div>
      )}
    </div>
  );
}
