"use client";

import { Fragment, useState, type ReactNode } from "react";
import { Fa, type FaIconName } from "@/components/icons";
import { ResultChart, type ChartVisibility } from "@/components/ResultChart";
import { useTest } from "@/components/TestProvider";
import { cn } from "@/lib/cn";

function Stat({ label, tip, children }: { label: string; tip: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-sub">{label}</div>
      <div className="relative cursor-pointer text-[2em] leading-[1em] text-main" aria-label={tip} data-balloon-pos="up">
        {children}
      </div>
    </div>
  );
}

function BigStat({ label, value, tip }: { label: string; value: string; tip: string }) {
  return (
    <div className="text-[2rem]">
      <div className="flex items-center leading-[0.5em] text-sub">{label}</div>
      <div className="relative cursor-pointer text-[2em] text-main" aria-label={tip} data-balloon-pos="up">
        {value}
      </div>
    </div>
  );
}

function ResultButton({ icon, label, onClick }: { icon: FaIconName; label: string; onClick?: () => void }) {
  return (
    <button type="button" className="mt-button items-baseline px-[2em] py-[1em] max-sm:col-span-2" aria-label={label} data-balloon-pos="down" onClick={onClick}>
      <Fa icon={icon} />
    </button>
  );
}

const legendButton = "mt-button px-3 py-1.5 leading-[15px] hover:bg-sub-alt";

export function ResultScreen() {
  const { state, restart } = useTest();
  const [vis, setVis] = useState<ChartVisibility>({ raw: true, burst: true, errors: true });
  const { result, keys } = state;
  if (!result) return null;

  const { wpm, raw, acc, consistency, seconds, testType, chars, chart } = result;
  const toggle = (key: keyof ChartVisibility) => setVis((v) => ({ ...v, [key]: !v[key] }));
  const struck = (on: boolean) => cn("pointer-events-none", !on && "line-through");

  return (
    <div id="result">
      <div className="mb-4 grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="grid items-center justify-center gap-2">
          <BigStat label="wpm" value={String(Math.round(wpm))} tip={`${wpm.toFixed(2)} wpm`} />
          <BigStat
            label="acc"
            value={`${Math.floor(acc)}%`}
            tip={`${acc.toFixed(2)}%\n${keys.correct} correct\n${keys.total - keys.correct} incorrect`}
          />
        </div>
        <div className="group relative h-50 w-full">
          <div className="pointer-events-none absolute right-0 bottom-[-0.75em] z-10 flex rounded bg-bg p-[3px] text-xs opacity-0 transition-opacity duration-250 group-hover:pointer-events-auto group-hover:opacity-100">
            <button type="button" tabIndex={-1} className={legendButton}>
              <Fa icon="chart-line" className="text-sub" />
              scale
            </button>
            <button type="button" tabIndex={-1} className={legendButton} onClick={() => toggle("raw")}>
              <div className="pointer-events-none h-[0.25em] w-[1.5em] rounded bg-main/60" />
              <div className={struck(vis.raw)}>raw</div>
            </button>
            <button type="button" tabIndex={-1} className={legendButton} onClick={() => toggle("burst")}>
              <div className="pointer-events-none h-[0.25em] w-[1.5em] rounded bg-sub" />
              <div className={struck(vis.burst)}>burst</div>
            </button>
            <button type="button" tabIndex={-1} className={legendButton} onClick={() => toggle("errors")}>
              <Fa icon="times" className="text-error" />
              <div className={struck(vis.errors)}>errors</div>
            </button>
          </div>
          <ResultChart data={chart} visibility={vis} />
        </div>
      </div>

      <div className="mb-4 grid grid-flow-col items-start justify-between gap-x-8 gap-y-2 max-sm:grid-flow-row max-sm:grid-cols-2">
        <div>
          <div className="text-sub">test type</div>
          <div className="text-main">
            {testType.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </div>
        </div>
        <Stat label="raw" tip={`${raw.toFixed(2)} wpm`}>
          {Math.round(raw)}
        </Stat>
        <Stat label="characters" tip={"correct\nincorrect\nextra\nmissed"}>
          {`${chars.correct}/${chars.incorrect}/${chars.extra}/${chars.missed}`}
        </Stat>
        <Stat label="consistency" tip={`${consistency.toFixed(2)}%`}>
          {Math.round(consistency)}%
        </Stat>
        <Stat label="time" tip={`${seconds.toFixed(2)}s`}>
          {Math.round(seconds)}s
          <div className="ml-[0.2rem] text-[0.75rem] leading-[0.75rem] text-sub">
            00:00:{String(Math.round(seconds)).padStart(2, "0")} session
          </div>
        </Stat>
      </div>

      <div className="mb-4 text-center text-sub">
        <a href="/login" onClick={(e) => e.preventDefault()}>
          Sign in
        </a>{" "}
        to save your result
      </div>

      <div className="grid grid-flow-col justify-center gap-4 max-sm:grid-flow-row max-sm:grid-cols-2">
        <ResultButton icon="chevron-right" label="Next test" onClick={restart} />
        <ResultButton icon="sync-alt" label="Repeat test" onClick={restart} />
        <ResultButton icon="exclamation-triangle" label="Practice words" />
        <ResultButton icon="align-left" label="Toggle words history" />
        <ResultButton icon="backward" label="Watch replay" />
        <ResultButton icon="image" label={"Copy screenshot to clipboard\n(shift click to download)"} />
      </div>
    </div>
  );
}
