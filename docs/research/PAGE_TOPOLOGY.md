# monkeytype.com — Page Topology (1440×900)

Single-screen app. No vertical scroll on the test page (body is `overflow: hidden auto`; page fits viewport).

## Layers (z-order, top first)
1. `CookieModal` — `<dialog>` fixed full-screen, z 1000, first visit only. Overlay.
2. `MerchBanner` — fixed top-0, z 1000, full width, 36px (xl) / 56px (mobile wrap).
3. `CommandLineFab` — fixed bottom-left, z 99, touch devices only.
4. Top accent strip — fixed top-0, z -1, 8px tall, bg `--main-color`, `width:100vw` (sits behind banner; only visible when banner closed).
5. `#app` — flow content.

## #app layout
`#app.content-grid`: `display:grid; grid-template-rows: [top-start] auto [content-start] 1fr [content-end] auto [top-end]; row-gap: 32px; padding: <banner height + 32px> 0 32px; min-height: 100vh;` (at 1440: padding-top 68px, rows 36px / 617px / 83px; height 900).

`.content-grid` columns (shared helper, nested repeatedly):
```
--padding-inline: 2rem; --content-max-width: 1536px;
--breakout-size: calc((calc(var(--content-max-width) + 12rem) - var(--content-max-width)) / 2);
grid-template-columns:
  [full-width-start] var(--padding-inline)
  [full-width-padding-start] minmax(0,1fr)
  [breakout-start] minmax(0, var(--breakout-size))
  [content-start] min(100% - var(--padding-inline)*2, var(--content-max-width))
  [content-end] minmax(0, var(--breakout-size))
  [breakout-end] minmax(0,1fr)
  [full-width-padding-end] var(--padding-inline) [full-width-end];
justify-content:center;
```
Children default to `grid-column: content`; `.full-width { grid-column: full-width }`, `.breakout { grid-column: breakout }`.
At 1440 (viewport minus 10px scrollbar = 1430): content column = 1280px starting x=75.

## Sections top → bottom
| # | Name | Component | Interaction model |
|---|---|---|---|
| 1 | Header (logo + nav icons + alerts/login) | `Header` | static + hover; fades in focus mode |
| 2 | Test config bar | `TestConfig` | click-driven (mode/option selection) |
| 3 | Language button | part of `TypingTest` | static + hover |
| 4 | Words + caret + live counter + focus overlay | `TypingTest` / `Words` / `Caret` | keyboard-driven (time-driven timer) |
| 5 | Restart button | part of `TypingTest` | click / Tab+Enter |
| 5' | Result screen (replaces 3–5 after test) | `ResultScreen` + `ResultChart` | static + click |
| 6 | Footer (key hints, links, theme, version) | `Footer` | static + hover; fades in focus mode |

`main > .pageTest` is a grid `grid-template-rows: 1fr auto 1fr`: config bar in row 1 (top), typing test centered in row 2, row 3 empty — so the test is vertically centered between header and footer.

## Shared state (client)
`useTypingTest` (single hook/context) owns: mode, mode options (time/words/quote length), punctuation, numbers, words list, input history, current word index, timer, started/finished flags, focus mode, per-second wpm/raw/errors samples, result stats. Header, TestConfig, TypingTest, Footer, ResultScreen read from it.
