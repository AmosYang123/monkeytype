"use client";

import { Fragment, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Fa, type FaIconName } from "@/components/icons";
import { ResultChart, type ChartVisibility } from "@/components/ResultChart";
import { useTest } from "@/components/TestProvider";
import { useConfig } from "@/components/ConfigProvider";
import { showModal } from "@/lib/modals";
import { cn } from "@/lib/cn";
import { setConfig } from "@/lib/config/store";
import { notify } from "@/lib/notifications";
import { testDuration } from "@/lib/test-reducer";
import { buildHeatmap, heatmapWordColor, type Heatmap } from "@/lib/burst-heatmap";
import { correctedHistory, jumpTime, missedWords, replayInputs, replayStats } from "@/lib/replay";
import type { TestConfig } from "@/types/test";

function Stat({
  label,
  tip,
  children,
}: {
  label: string;
  tip: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="text-sub">{label}</div>
      <div
        className="relative cursor-pointer text-[2em] leading-[1em] text-main"
        aria-label={tip}
        data-balloon-pos="up"
      >
        {children}
      </div>
    </div>
  );
}

function BigStat({
  label,
  value,
  tip,
  note,
}: {
  label: ReactNode;
  value: string;
  tip: string;
  note?: ReactNode;
}) {
  return (
    <div className="text-[2rem]">
      <div className="flex items-center leading-[0.5em] text-sub">{label}</div>
      <div
        className="relative cursor-pointer text-[2em] text-main"
        aria-label={tip}
        data-balloon-pos="up"
      >
        {value}
      </div>
      {note && <div className="-mt-2 text-base leading-5 text-sub">{note}</div>}
    </div>
  );
}

/** "+6 vs avg10" against the saved average from before this result; null without history */
function averageDelta(wpm: number, average10: number): string | null {
  if (average10 <= 0) return null;
  const diff = Math.round(wpm) - average10;
  return `${diff > 0 ? "+" : diff < 0 ? "−" : "±"}${Math.abs(diff)} vs avg10`;
}

function ResultButton({
  icon,
  label,
  className,
  onClick,
}: {
  icon: FaIconName;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn("mt-button items-baseline px-[2em] py-[1em]", className)}
      aria-label={label}
      data-balloon-pos="down"
      onClick={onClick}
    >
      <Fa icon={icon} />
    </button>
  );
}

const roundTo2 = (n: number) => Math.round(n * 100) / 100;

const legendButton = "mt-button px-3 py-1.5 leading-[15px] hover:bg-sub-alt";

/** upstream canQuickRestart: long tests don't open the words history automatically */
function historyOpensByDefault(c: TestConfig): boolean {
  if (c.mode === "words") return c.words > 0 && c.words < 1000;
  if (c.mode === "time") return c.time > 0 && c.time < 900;
  return true;
}

// upstream failReason wording ("min accuracy"); the engine says "minimum accuracy"
const FAIL_LABELS: Record<string, string> = { "minimum accuracy": "min accuracy" };

const correctedLetter = "border-b-2 border-dotted border-main";
const extraCorrectedLetter = "border-r-2 border-dotted border-main";

/** upstream buildWordLetters + letterClass: untyped letters keep the word's color; `corrected` marks fixed letters */
function historyLetters(input: string | undefined, target: string, zen: boolean, corrected = ""): { char: string; className?: string; border?: string }[] {
  const typed = [...(input ?? "")];
  const want = [...target];
  const fixed = [...corrected];
  return Array.from({ length: Math.max(typed.length, want.length) }, (_, c) => {
    const got = typed[c];
    const expected = want[c];
    // letters typed past this one were deleted again
    const border = cn(c >= want.length - 1 && c + 1 === typed.length && fixed.length > typed.length && extraCorrectedLetter);
    if (zen || (expected !== undefined && got === expected)) {
      return { char: got === " " ? "_" : (got ?? ""), className: "text-text", border: cn(border, fixed[c] !== undefined && fixed[c] !== got && correctedLetter) };
    }
    if (expected === undefined) return { char: got, className: "text-error-extra" };
    if (got === undefined) return { char: expected };
    return { char: expected, className: "text-error", border };
  });
}

const wordClass = "word relative mt-[0.18rem] mr-[0.6rem] mb-[0.15rem] ml-0 border-b-2 text-[1em] leading-[1em] [font-variant:no-common-ligatures]";

const errorWord =
  "border-error [text-shadow:1px_0_0_var(--bg-color),-1px_0_0_var(--bg-color),0_1px_0_var(--bg-color),1px_1px_0_var(--bg-color),-1px_1px_0_var(--bg-color)]";

function HistoryWord({
  input,
  corrected,
  target,
  burst,
  error,
  zen,
  heatmap,
}: {
  input: string | undefined;
  corrected: string | undefined;
  target: string;
  burst: number | undefined;
  error: boolean;
  zen: boolean;
  heatmap: Heatmap | null;
}) {
  const [hover, setHover] = useState(false);
  const color = heatmap ? heatmapWordColor(burst, heatmap) : undefined;
  const inherit = color !== undefined && burst !== undefined;
  // upstream hover shows the corrected history (what was first typed)
  const typed = (corrected || (input ?? "")).replace(/ /g, "_").replace(/[\t\n]/g, "_");
  const speed = burst === undefined || isNaN(burst) || burst >= 1000 ? "Infinite" : String(Math.trunc(burst));
  return (
    <div
      className={cn(
        wordClass,
        typed !== "" && "cursor-none",
        error ? errorWord : "border-transparent",
      )}
      style={{ color }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {historyLetters(input, target, zen, corrected).map((l, i) => (
        <span key={i} className={cn("inline-block", !inherit && l.className, l.border)}>
          {l.char}
        </span>
      ))}
      {hover && typed !== "" && (
        <div className="pointer-events-none absolute top-[-0.5rem] z-10 -ml-2 rounded bg-sub p-2 whitespace-nowrap text-bg [text-shadow:none]">
          <div>{typed}</div>
          <div className="text-[0.75rem] text-sub-alt">{speed} wpm</div>
        </div>
      )}
    </div>
  );
}

function TitleButton({ icon, text, className, onClick }: { icon: FaIconName; text: string; className?: string; onClick: (event: MouseEvent) => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={cn("mt-button inline-block px-[0.25em] py-0", className)}
      aria-label={text}
      data-balloon-pos="up"
      onClick={onClick}
    >
      <Fa icon={icon} />
    </button>
  );
}

async function copyToClipboard(content: string, message = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(content);
    notify(message, { level: "notice", durationMs: 2000 });
  } catch {
    notify("Could not copy to clipboard", { level: "error" });
  }
}

function cssColor(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function WordsHistory({ heatmapOn }: { heatmapOn: boolean }) {
  const { state } = useTest();
  const { words, inputs, config } = state;
  const bursts = state.result?.wordBursts ?? [];
  const zen = config.mode === "zen";
  // the in-progress word only counts when something was typed into it
  const typedCount = inputs.length - (inputs[inputs.length - 1] === "" ? 1 : 0);
  const typedTargets = zen ? inputs.slice(0, typedCount) : words.slice(0, typedCount);
  const timed = testDuration(config) > 0;
  const corrected = correctedHistory(state.events);
  const heatmap = heatmapOn
    ? buildHeatmap(bursts, {
        main: cssColor("--main-color"),
        sub: cssColor("--sub-color"),
        subAlt: cssColor("--sub-alt-color"),
        text: cssColor("--text-color"),
        colorfulError: cssColor("--colorful-error-color"),
      })
    : null;

  const copySlow = () => {
    const valid = bursts.filter((b) => Number.isFinite(b) && b > 0);
    // ponytail: upstream asks for the threshold in a modal; this uses its default (average burst)
    const threshold = valid.length > 0 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 80;
    const slow = typedTargets.filter((_, i) => (bursts[i] ?? Infinity) < threshold);
    if (slow.length === 0) {
      notify(`No words typed under ${threshold} WPM`, { level: "notice" });
      return;
    }
    void copyToClipboard(slow.join(" "), `Copied ${slow.length} slow word${slow.length > 1 ? "s" : ""} to clipboard`);
  };

  const shown = zen ? typedCount : Math.min(words.length, typedCount + 2);
  return (
    <div id="resultWordsHistory" className="relative mb-4 text-sub">
      <div className="mb-1 flex items-center select-none">
        <span>input history</span>
        <TitleButton className="ml-[0.5em]" icon="align-left" text="Copy words list" onClick={() => void copyToClipboard(typedTargets.join(zen ? "" : " "))} />
        <TitleButton
          icon="times"
          text="Copy missed words list"
          onClick={() =>
            void copyToClipboard(zen ? inputs.join("") : missedWords(state.events, words).join(" "))
          }
        />
        <TitleButton icon="tachometer-alt" text="Copy slow words list" onClick={copySlow} />
        <TitleButton icon="fire-alt" text="Toggle burst heatmap" onClick={() => setConfig("burstHeatmap", !heatmapOn)} />
        {heatmap && heatmap.legend.length > 0 && (
          <div className="ml-2 inline-grid w-min grid-cols-[auto_auto_auto] gap-4 text-[0.75rem] text-sub">
            <div className="grid grid-cols-[repeat(5,1fr)]">
              {heatmap.legend.map((text, i) => (
                <div
                  key={i}
                  className="grid h-4 place-content-center px-2 py-[0.1rem] leading-[0.75rem] whitespace-nowrap text-bg first:rounded-l last:rounded-r"
                  style={{ background: heatmap.colors[i] }}
                >
                  <div>{text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="words flex w-full flex-wrap content-start">
        {Array.from({ length: shown }, (_, i) => {
          const input = inputs[i];
          const target = zen ? (input ?? "") : words[i];
          const isLast = i === typedCount - 1;
          const showError = !zen && !(isLast && timed && target.startsWith(input ?? "")) && input !== undefined && input !== "";
          return (
            <HistoryWord
              key={i}
              input={i < typedCount ? input : undefined}
              corrected={i < typedCount ? corrected[i] : undefined}
              target={target}
              burst={bursts[i]}
              error={showError && input !== target}
              zen={zen}
              heatmap={heatmap}
            />
          );
        })}
      </div>
    </div>
  );
}

const PLAY_TEXT = { start: "Start replay", playing: "Pause replay", paused: "Resume replay" } as const;

/** upstream ResultReplay: letter-by-letter playback of the recorded keys */
function ResultReplay() {
  const { state } = useTest();
  const { events, words, config } = state;
  const wpmHistory = state.result?.chart.wpm ?? [];
  const zen = config.mode === "zen";
  const final = replayInputs(events, Infinity);
  const targets = zen ? final : words.slice(0, final.length);
  const end = events.at(-1)?.ms ?? 0;
  // cursor: replay time in ms (Infinity = played to the end); startedAt: performance.now() at replay time 0 while playing
  const [cursor, setCursor] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const playState = startedAt !== null ? "playing" : paused ? "paused" : "start";

  useEffect(() => {
    if (startedAt === null) return;
    let id = 0;
    const frame = () => {
      const t = performance.now() - startedAt;
      if (t > end) {
        setCursor(Infinity);
        setStartedAt(null);
        setPaused(false);
        return;
      }
      setCursor(t);
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [startedAt, end]);

  // handlers take the click's timeStamp (same clock as performance.now)
  const pause = (now: number) => {
    if (startedAt === null) return;
    setCursor(now - startedAt);
    setStartedAt(null);
    setPaused(true);
  };
  const togglePlayback = (now: number) => {
    if (startedAt !== null) return pause(now);
    const from = cursor === Infinity ? 0 : cursor;
    setCursor(from);
    setStartedAt(now - from);
  };
  const jump = (now: number, word: number, letter: number) => {
    pause(now);
    setCursor(jumpTime(events, word, letter));
  };

  const inputs = replayInputs(events, cursor);
  const active = inputs.length - 1;
  const seconds = cursor === Infinity ? Math.round(end / 1000) : Math.floor(cursor / 1000);
  return (
    <div id="resultReplay" className="mb-4 text-sub">
      <div className="mb-1 flex items-center select-none">
        watch replay{" "}
        <TitleButton className="ml-[0.5em]" icon={playState === "playing" ? "pause" : "play"} text={PLAY_TEXT[playState]} onClick={(e) => togglePlayback(e.timeStamp)} />
        <p id="replayStats" className="m-0 ml-[0.5em] inline-block text-main">
          {replayStats(seconds, wpmHistory)}
        </p>
      </div>
      <div id="replayWordsWrapper">
        <div id="replayWords" className="words flex w-full cursor-pointer flex-wrap content-start select-none">
          {targets.map((target, i) => (
            <div key={i} className={cn(wordClass, !zen && i < active && inputs[i] !== target ? errorWord : "border-transparent")}>
              {historyLetters(i <= active ? inputs[i] : undefined, target, false).map((l, c) => (
                <span key={c} className={cn("inline-block", l.className)} onClick={(e) => jump(e.timeStamp, i, c)}>
                  {l.char}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** upstream ResultAds: static result slot; no ad network here, so it shows the ad-blocker fallback text */
function ResultAds() {
  return (
    <div className="full-width mt-4">
      <div
        id="ad-result-wrapper"
        className="ad full-width advertisement ad-h mx-auto grid h-[90px] w-[728px] justify-center bg-sub-alt max-[calc(640px+5rem)]:hidden"
      >
        <div className="iconAndText col-start-1 row-start-1 grid grid-cols-[auto_1fr] items-center justify-center gap-4 justify-self-center">
          <div className="icon grid items-center justify-center text-[3rem] text-sub">
            <Fa icon="ad" fw={false} />
          </div>
          <div className="text textRight text-base text-sub">
            Using an ad blocker? No worries
            <div className="smalltext text-[0.7rem]">
              We understand ads can be annoying
              <br />
              You can{" "}
              <a href="/settings#ads">
                <i>disable all ads</i>
              </a>{" "}
              in the settings
            </div>
          </div>
        </div>
        <div id="ad-result" className="col-start-1 row-start-1" />
      </div>
      <div
        id="ad-result-small-wrapper"
        className="ad advertisement ad-h-s mx-auto hidden h-[50px] w-[320px] justify-center bg-sub-alt max-[calc(640px+5rem)]:grid max-[355px]:hidden"
      >
        <div className="icon small col-start-1 row-start-1 grid items-center justify-center text-[1.5rem] text-sub">
          <Fa icon="ad" fw={false} />
        </div>
        <div id="ad-result-small" className="col-start-1 row-start-1" />
      </div>
    </div>
  );
}

export function ResultScreen() {
  const { state, restart, repeat, comparison } = useTest();
  const config = useConfig();
  const [scale, setScale] = useState(config.startGraphsAtZero);
  const [history, setHistory] = useState(() => config.alwaysShowWordsHistory && historyOpensByDefault(state.config));
  const [replay, setReplay] = useState(false);
  // upstream #resultButtonsPrefocusTarget: focused on show so Tab lands on "Next test"
  const prefocusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    prefocusRef.current?.focus({ preventScroll: true });
    // upstream Misc.scrollToCenterOrTop(#result)
    const el = document.getElementById("result");
    el?.scrollIntoView({ block: el.offsetHeight < window.innerHeight ? "center" : "start" });
  }, []);
  const [vis, setVis] = useState<ChartVisibility>({
    raw: true,
    burst: true,
    errors: true,
  });
  const { result, keys } = state;
  if (!result) return null;

  const { wpm, raw, acc, consistency, seconds, testType, chars, chart } =
    result;
  const toggle = (key: keyof ChartVisibility) =>
    setVis((v) => ({ ...v, [key]: !v[key] }));
  const afkPercent = roundTo2((result.afkDuration / seconds) * 100 || 0);
  const struck = (on: boolean) =>
    cn("pointer-events-none", !on && "line-through");
  const newPb = comparison !== null && wpm > comparison.previousPb;
  const pbTip = comparison?.previousPb ? `new personal best\nprevious ${roundTo2(comparison.previousPb)} wpm` : "first result for this test type";
  const other = [
    ...(result.failed ? [`failed (${FAIL_LABELS[result.failReason ?? ""] ?? result.failReason})`] : []),
    ...(result.afkDetected ? ["afk detected"] : []),
    ...(result.isRepeated ? ["repeated"] : []),
  ];

  return (
    <div id="result" className="full-width content-grid">
      <div>
        <div className="mb-4 grid gap-4 md:grid-cols-[auto_1fr]">
          <div className="grid items-center justify-center gap-2">
            <BigStat
              label={
                <>
                  wpm
                  {newPb && (
                    <span className="ml-[0.4em] text-main" aria-label={pbTip} data-balloon-pos="up" role="img">
                      <Fa icon="crown" />
                    </span>
                  )}
                </>
              }
              value={String(Math.round(wpm))}
              tip={`${wpm.toFixed(2)} wpm`}
              note={comparison && averageDelta(wpm, comparison.average10)}
            />
            <BigStat
              label="acc"
              value={`${Math.floor(acc)}%`}
              tip={`${acc.toFixed(2)}%\n${keys.correct} correct\n${keys.total - keys.correct} incorrect`}
            />
          </div>
          <div className="group relative h-50 w-full">
            <div className="pointer-events-none absolute right-0 bottom-[-0.75em] z-10 flex rounded bg-bg p-[3px] text-xs opacity-0 transition-opacity duration-250 group-hover:pointer-events-auto group-hover:opacity-100">
              <button type="button" tabIndex={-1} className={legendButton} onClick={() => setScale(!scale)}>
                <Fa icon="chart-line" className="text-sub" />
                scale
              </button>
              <button
                type="button"
                tabIndex={-1}
                className={legendButton}
                onClick={() => toggle("raw")}
              >
                <div className="pointer-events-none h-[0.25em] w-[1.5em] rounded bg-main/60" />
                <div className={struck(vis.raw)}>raw</div>
              </button>
              <button
                type="button"
                tabIndex={-1}
                className={legendButton}
                onClick={() => toggle("burst")}
              >
                <div className="pointer-events-none h-[0.25em] w-[1.5em] rounded bg-sub" />
                <div className={struck(vis.burst)}>burst</div>
              </button>
              <button
                type="button"
                tabIndex={-1}
                className={legendButton}
                onClick={() => toggle("errors")}
              >
                <Fa icon="times" className="text-error" />
                <div className={struck(vis.errors)}>errors</div>
              </button>
            </div>
            <ResultChart data={chart} visibility={vis} startAtZero={scale} />
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
          {other.length > 0 && (
            <div>
              <div className="text-sub">other</div>
              <div className="text-main">
                {other.map((line, i) => (
                  <Fragment key={i}>
                    {i > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </div>
            </div>
          )}
          <Stat label="raw" tip={`${raw.toFixed(2)} wpm`}>
            {Math.round(raw)}
          </Stat>
          <Stat label="characters" tip={"correct\nincorrect\nextra\nmissed"}>
            {`${chars.correct}/${chars.incorrect}/${chars.extra}/${chars.missed}`}
          </Stat>
          <Stat label="consistency" tip={`${consistency.toFixed(2)}%`}>
            {Math.round(consistency)}%
          </Stat>
          <Stat label="time" tip={`${roundTo2(seconds)}s (${result.afkDuration}s afk ${afkPercent}%)`}>
            {Math.round(seconds)}s
            {afkPercent > 0 && <div className="ml-[0.2rem] text-[0.75rem] leading-[0.75rem] text-sub">{afkPercent}% afk</div>}
            <div className="ml-[0.2rem] text-[0.75rem] leading-[0.75rem] text-sub">
              00:00:{String(Math.round(seconds)).padStart(2, "0")} session
            </div>
          </Stat>
        </div>

        {history && <WordsHistory heatmapOn={config.burstHeatmap} />}
        {replay && <ResultReplay />}
        <div className="mb-4 text-center text-sub">
          <a href="/login">
            Sign in
          </a>{" "}
          to save your result
        </div>
        <div id="resultButtonsPrefocusTarget" ref={prefocusRef} tabIndex={-1} className="focus:outline-none focus-visible:outline-none" />

        <div className="grid grid-flow-col justify-center gap-4 max-sm:grid-flow-row max-sm:grid-cols-2">
          <ResultButton
            className="max-sm:col-span-2"
            icon="chevron-right"
            label="Next test"
            onClick={restart}
          />
          <ResultButton icon="sync-alt" label="Repeat test" onClick={repeat} />
          <ResultButton icon="exclamation-triangle" label="Practice words" onClick={() => showModal("PractiseWords")} />
          <ResultButton icon="align-left" label="Toggle words history" onClick={() => setHistory(!history)} />
          <ResultButton icon="backward" label="Watch replay" onClick={() => setReplay(!replay)} />
          <ResultButton
            className="max-sm:col-span-2"
            icon="image"
            label="Copy screenshot to clipboard"
            // ponytail: real capture needs a DOM-to-image dependency (not approved); upstream also shift-click downloads
            onClick={() => notify("Screenshot copying is unavailable in this local clone.", { level: "notice" })}
          />
        </div>
      </div>
      {config.ads !== "off" && <ResultAds />}
    </div>
  );
}
