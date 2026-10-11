# ResultScreen + ResultChart Specification

## Overview
- **Target files:** `src/components/ResultScreen.tsx`, `src/components/ResultChart.tsx`
- **Screenshot:** `docs/design-references/desktop-1440-result.png`
- **Interaction model:** static + click (next/repeat restart the test) + hover (chart legend fades in on chart hover; tooltips on stats).
- Rendered by the page in place of the typing test when `useTest().state.finished && state.result`.

## Data
`state.result: TestResult` (from `@/types/test`):
```ts
{ wpm, raw, acc, consistency, seconds, testType: string[], chars: { correct, incorrect, extra, missed, ... }, chart: { labels: string[], wpm: number[], raw: number[], burst: number[], err: number[] } }
```
Display rounding: big wpm `Math.round(wpm)`; tooltip `${wpm.toFixed(2)} wpm`. acc: `Math.floor(acc)%`; tooltip `${acc.toFixed(2)}%\n${keys correct} correct\n${keys incorrect} incorrect` (use `state.keys.correct` and `state.keys.total - state.keys.correct`). raw `Math.round`, tooltip `${raw.toFixed(2)} wpm`. characters `${correct}/${incorrect}/${extra}/${missed}`, tooltip `correct\nincorrect\nextra\nmissed`. consistency `Math.round(c)%`, tooltip `${c.toFixed(2)}%`. time `${Math.round(seconds)}s`, tooltip `${Math.round(seconds)}s`. Test type: lines of `testType` joined by `<br>`.

## DOM / computed styles (1440)
Root `div#result` — occupies the content column (1280px, x=75). Starts y=180 (vertically placed in the middle row of the test page grid).
1. `div.mb-4 grid gap-4 md:grid-cols-[auto_1fr]` (margin-bottom 16px, gap 16px, height 200)
   - left `div.grid items-center justify-center gap-2` (gap 8px; rows 96px 96px; width 115):
     - group `div.text-[2rem]` (32px/40px): label `div.flex items-center leading-[0.5em] text-sub` "wpm" (line-height 16px); value `div.text-[2em] text-main` (64px, line-height 80px, color #e2b714) `aria-label` tooltip `data-balloon-pos="up"`.
     - group same structure: "acc" / value.
   - right `div.group relative h-50 w-full` (height 200px): `<ResultChart>` canvas fills it (h-full w-full).
     - legend overlay: `div.pointer-events-none absolute right-0 bottom-[-0.75em] flex rounded bg-bg p-[3px] text-xs opacity-0 transition-opacity duration-250 group-hover:pointer-events-auto group-hover:opacity-100` (12px font). Buttons (`.mt-button` with padding 6px 12px, line-height 15px): `[Fa chart-line] scale`, `[3px×18px bar bg-main/60] raw`, `[bar bg-sub] burst`, `[Fa times text-error] errors`. Clicking raw/burst/errors toggles that dataset's visibility (state in ResultScreen, passed to chart). scale: no-op.
2. Stats row `div.mb-4 grid grid-flow-col items-start justify-between gap-x-8 gap-y-2` (height 76; justify space-between). Each stat: label `div.text-sub` (16px/20px) + value `div.text-[2em] leading-[1em] text-main` (32px/32px) with aria-label tooltip (`data-balloon-pos="up"`):
   - "test type" → value is `div.text-main` 16px/20px (NOT 2em) with lines from `testType` separated by `<br>`.
   - "raw", "characters", "consistency", "time" (time value also has two sub lines `div.ml-[0.2rem] text-[0.75rem] leading-[0.75rem] text-sub`: skip afk line; show `00:00:${pad(seconds)} session` — e.g. "00:00:15 session").
3. `div.mb-4 text-center text-sub` (16px): `<a href="/login">Sign in</a> to save your result` (link preventDefault).
4. Buttons `div.grid grid-flow-col justify-center gap-4` (gap 16px). Each `button` (`.mt-button` + `px-[2em] py-[1em]` → padding 16px 32px, 84×52, `align-items: baseline`) with `aria-label` + `data-balloon-pos="down"`, icon 20×20:
   - "Next test" `chevron-right` → `restart()`
   - "Repeat test" `sync-alt` → `restart()` (same words not required)
   - "Practice words" `exclamation-triangle` (no-op)
   - "Toggle words history" `align-left` (no-op)
   - "Watch replay" `backward` (no-op)
   - "Copy screenshot to clipboard\n(shift click to download)" `image` (regular) (no-op)
5. Ad slot: skip (third-party ad). 

## ResultChart (Chart.js 4, already installed as `chart.js`)
Register: `LineController, LineElement, PointElement, LinearScale, CategoryScale, ScatterController, Filler, Tooltip`. Defaults: `Chart.defaults.animation = false` (duration 0), `elements.line.tension = 0.5`, `elements.line.fill = "origin"`, `font.family = "Roboto Mono"`.
Read theme colors from CSS vars at runtime (`getComputedStyle(document.documentElement).getPropertyValue("--main-color")` etc.): main #e2b714, sub #646669, subAlt #2c2e31, error #ca4754.
Datasets (order matters):
1. wpm: `data: chart.wpm`, borderColor main, backgroundColor "transparent", pointBackgroundColor/pointBorderColor main, borderWidth 3, yAxisID "wpm", order 2, pointRadius 1, clip false
2. raw: `chart.raw`, borderColor `main + "99"`, backgroundColor transparent, point colors same, borderWidth 2, yAxisID "raw", borderDash [8,8], order 3, pointRadius 0, clip false
3. errors: type "scatter", `chart.err`, border/background error, borderWidth 2, order 1, yAxisID "error", pointStyle "crossRot", pointRadius: ctx => value>0 ? 3 : 0, pointHoverRadius: value>0 ? 5 : 0
4. burst: `chart.burst`, borderColor sub, backgroundColor `subAlt + "80"`, point colors sub, borderWidth 3, yAxisID "burst", order 4, pointRadius 1
Scales:
- x: ticks autoSkip, autoSkipPadding 20; title hidden
- wpm: display true, title "Words per Minute" (shown), beginAtZero, min 0, max = max(all wpm/raw/burst values) rounded up, ticks autoSkip/autoSkipPadding 20, grid shown
- raw, burst: display false, same min/max as wpm
- error: display true, position "right", title "Errors", beginAtZero, max = Math.max(...err) (≥1), ticks precision 0, grid hidden
All scales: ticks.color sub, title.color sub, grid.color subAlt, grid.tickColor subAlt, border color subAlt.
Options: responsive true, maintainAspectRatio false, plugins.legend.display false, tooltip { mode "index", intersect false, animation { duration 250 } }.
Destroy chart on unmount; update when data/visibility changes.

## Responsive Behavior
- ≥849 (md): wpm/acc column left of chart.
- <849: stacked (grid single column): wpm/acc above chart; stats row wraps (use `max-sm:grid-cols-2` / `grid-flow-row` below sm).

## Imports available
- `useTest` from `@/components/TestProvider` → `{ state, restart }`
- `Fa` from `@/components/icons`; `cn` from `@/lib/cn`; `.mt-button`, balloon tooltips in globals.css
