# monkeytype.com — Behaviors

Captured 2026-10-11 via Chrome DevTools MCP at 1440×900, 768×1024, 390×844 (theme: serika dark, v26.32.0).

## Global
- No smooth-scroll library. Native scrolling. `body { overflow: hidden auto }`.
- Custom scrollbar: `::-webkit-scrollbar{width:7px}`, track transparent, thumb `var(--sub-color)` radius 2px, hover `var(--text-color)`, active `var(--main-color)`.
- `::selection { background: var(--main-color); color: var(--sub-alt-color) }`.
- `a { color: var(--sub-color); transition: color .125s, opacity .125s, background .125s; display:inline-block }`, `a:hover { color: var(--text-color) }`.
- Tooltips: balloon.css pattern on `[aria-label][data-balloon-pos]` — bg `#101010f2`, text `#fff`, 12px, padding `.5em 1em`, radius 2px, 5px arrow, `transition: all .18s ease-out .18s`, move 4px.

## Focus mode (typing) — the main interaction
Trigger: first keystroke into the hidden `<textarea id="wordsInput">` while the test page is shown.
State changes (all fade with their existing `transition: opacity`):
| Element | idle | typing |
|---|---|---|
| nav icon links/buttons | opacity 1 | opacity 0 (via `--nav-focus-opacity: 0`) |
| logo SVG | color `--main-color` | color `--sub-color` (transition colors .25s) |
| logo "monkeytype" h1 | `--text-color` | `--sub-color` (.25s) |
| logo "monkey see" | `--sub-color` | transparent (.125s) |
| test config bar | 1 | 0 (.125s) |
| language button row | 1 | 0 (.125s) |
| restart button | 1 | 0 (.125s) |
| footer (both rows) | 1 | 0 (.25s) |
| body cursor | auto | `none` |
Exit: any `mousemove` (restores everything), test end, or restart.

## Words area focus / blur
- When `#wordsInput` is NOT focused (page load, click elsewhere): `#words { opacity:.25; filter: blur(4px); transition: .25s }`, caret hidden, overlay message shown centered over the 3 lines: `<i fa-mouse-pointer>` + "Click here or press any key to focus" (16px/24px, text color, gap 8px, z 999).
- Click anywhere on the words wrapper or press any key → input focused, blur removed, caret appears and blinks.

## Caret
- `#caret { background: var(--caret-color); border-radius: var(--roundness) (8px); width: .1em (3.2px @32px); height: 1.2em (38.4px); position:absolute; transform-origin:0 0 }`.
- Idle blink: `animation: 1s infinite caretFlashSmooth` — `@keyframes caretFlashSmooth { 0%,100% {opacity:0} 50% {opacity:1} }`.
- While keys are being pressed: `animation-name: none; opacity: 1`. Blink resumes ~1s after last key.
- Movement: JS-tweened `left`/`top` over ~100ms ease-out (smooth caret "medium"). Initial position `left: 8.5px; top: 6px` relative to `#wordsWrapper` content (first letter at x=10 minus 1.5).
- Caret sits at the left edge of the next untyped letter, or after the last typed letter (incl. extras).

## Letter / word states (from site CSS)
- untyped letter: `--sub-color` (#646669)
- correct: `--text-color` (#d1d0c5)
- incorrect: `--error-color` (#ca4754)
- extra (typed beyond word length, appended as letters): `--error-extra-color` (#7e2a33)
- every letter: `border-bottom: .05em solid transparent` (1.6px)
- word with any error after space pressed (`.word.error`): `border-bottom: 2px solid var(--error-color)`; normal words `border-bottom: 2px solid transparent`.
- Space with incomplete word: remaining letters stay untyped color, word marked error (underline). Word is "missed".
- Backspace: removes last typed char; can go back into previous word only if it had an error (monkeytype default "confidence off" lets you go back to incorrect words; correct words are locked).

## Line scrolling
- `#wordsWrapper` shows exactly 3 lines (height 156px = 3 × (35.5 + 2×8 margin) ≈ 154.5 + rounding), `overflow: visible clip`.
- When the caret moves onto the 3rd line, all words on the 1st line are removed and the rest shift up (instant, `margin-top` reset). Active line effectively stays on line 2 after the first scroll.

## Live counter (timer)
- Time mode: big number in `--main-color`, 32px/32px, sits above line 1 at `margin: -40px 0 0 8px` (x=83,y=311 at 1440). Shows remaining seconds; appears on first keystroke. Counts down every 1s; when 0 → result screen.
- Words mode: shows `typed/total` e.g. `3/50` in same style. Quote mode: `typed/total` words. Zen: none until typing (shows elapsed? none) — zen ends with shift+enter.

## Test config bar (click-driven)
- 3 cards in a grid `[1fr auto 1fr]` so the middle (mode) card stays centered.
- Mode card: time / words / quote / zen / custom — active = `--main-color`, others `--sub-color`, hover `--text-color`, transition color/background/opacity .125s.
- Left card: punctuation / numbers toggles (main color when on). Disabled (opacity .33, pointer-events none) in quote mode. Hidden (opacity 0, width 0) in zen mode.
- Right card by mode:
  - time: `15 30 60 120 [tools icon]` (default 30)
  - words: `10 25 50 100 [tools]` (default 50)
  - quote: `all short medium long thicc [search icon]` (default medium)
  - zen: hidden
  - custom: `change`
- Changing any option regenerates words and restarts the test (no animation besides button color).
- Punctuation on: capitalized sentence starts, commas/periods/apostrophes etc. Numbers on: random numeric tokens injected.

## Restart
- Restart button (fa-redo-alt) below words: click → new words. Tooltip "Restart Test" (balloon down).
- Keyboard: Tab focuses restart button; Enter then restarts ("tab > enter"). Escape / ctrl+shift+p opens command line (out of scope — no-op).

## Result screen (shown after test ends)
- Replaces typing test. Config bar disabled (opacity .33). Layout: left column wpm/acc big numbers (64px main color, labels 32px sub), chart (Chart.js) to the right, row of 5 secondary stats, "Sign in to save your result", 6 icon buttons (next, repeat, practice words, words history, replay, screenshot), ad slot 728×90.
- Next test (chevron) or Tab+Enter → new test.
- Chart legend buttons (scale/raw/burst/errors) appear on chart hover (opacity 0 → 1, .25s).

## Hover states (all `transition: color .125s cubic-bezier(.4,0,.2,1), background .125s, opacity .125s`)
- Nav icons, config buttons, footer buttons/links, language button, restart, result buttons: `--sub-color` → `--text-color`. Background stays transparent.
- Active (mousedown): color `--sub-color`.
- Merch banner link: color bg (#323437) underline → hover `--text-color`. Close button: bg color → hover `--text-color`.
- Cookie modal buttons: accept (bg main, text bg), others (bg sub-alt, text text). Hover: bg → `--text-color`, text → `--bg-color`.

## Merch banner (top, fixed)
- Fixed top, full width, bg `--main-color`, 36px tall at ≥1361px (xl) with merch2.png image on the left (216×36). Below xl: shopping-bag icon instead of image. Wraps to 56px at 390px.
- Close (×) removes banner; `#app` padding-top drops from banner+32px to 32px.

## Cookie modal (first visit)
- `<dialog>` full screen, backdrop `rgba(0,0,0,.5)`, content bottom-right, padding 32px; card 500px max, bg `--bg-color`, ring 4px `--sub-alt-color`, radius 16px, padding 32px.
- "accept all" / "reject non-essential" / "more options". Any choice closes it and persists (localStorage).

## Command line FAB (touch only)
- `@media (hover:none) and (pointer:coarse)`: fixed bottom-8 left-8, 48×48 round, bg main, fa-terminal in bg color. Hidden on desktop.

## Responsive
- Custom breakpoints: xs 426, sm 721, md 849, lg 1105, xl 1361, 2xl 1617.
- `.content-grid` max content width: 1536 → 1280 (≤1616) → 1024 (≤1360) → 768 (≤1104) → 640 (≤848) → 100% with 1rem padding (≤720). Padding-inline 2rem default.
- Config bar: hidden below md (849) — replaced by a single "test settings" button (cog icon, bg sub-alt, padding 8px 16px, radius 8px). Its CSS vars per breakpoint: font-size .5em/md .6em/lg .75em; card-gap .25em/md 1em/xl 2em; h-padding .4em/md .45em/lg .5em/xl 1em; v-padding .5rem/md .75rem.
- Logo text "monkeytype" hidden below sm (721); "monkey see" only ≥ lg (1105).
- Nav gap 4px below md, 8px md+.
- Footer links: grid 1 col → xs 2 cols → sm 4 cols → lg flex row. Right block (theme + version) column below lg, row lg+.
- Typing font stays 32px at all widths.
