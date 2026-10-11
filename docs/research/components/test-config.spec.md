# TestConfig Specification

## Overview
- **Target file:** `src/components/TestConfig.tsx`
- **Screenshots:** `docs/design-references/desktop-1440.png` (bar at y=136), `docs/design-references/tablet-768.png` ("test settings" button)
- **Interaction model:** click-driven. Clicking an option calls `setConfig(patch)` from `useTest()` which regenerates words and restarts. No enter/exit animation beyond color transitions.

## DOM Structure
```
div.full-width (row 1 of the test page grid; spans the whole content-grid)
  div.config-bar  (hidden below md=849px; grid on md+)
    div.left-wrap  (margin-right: var(--card-gap); width:max-content; place-self:end)
      div.card [punctuation][numbers]
    div.card.mode  (z-2) [time][words][quote][zen][custom]
    div.right-wrap (relative grid w-max)
      div.card (margin-left: var(--card-gap); display:grid; grid-auto-flow:column) [options per mode]
  button.test-settings (md:hidden)
```

## Computed Styles (1440px, ≥xl)
### config bar
- display: grid; grid-template-columns: `1fr auto 1fr`; justify-content: center; width: max-content; margin: 0 auto 32px (mb-8); position: relative
- font-size: `var(--font-size)`; line-height: 15px (from 1.25 × 12px)
- transition: opacity .125s cubic-bezier(.4,0,.2,1)
- CSS vars by breakpoint (Tailwind arbitrary props):
  - base: `--font-size:.5em; --card-gap:.25em; --horizontal-padding:.4em; --vertical-padding:.5rem`
  - md (849): `--font-size:.6em; --card-gap:1em; --horizontal-padding:.45em; --vertical-padding:.75rem`
  - lg (1105): `--font-size:.75em; --card-gap:1em; --horizontal-padding:.5em; --vertical-padding:.75rem`
  - xl (1361): `--font-size:.75em; --card-gap:2em; --horizontal-padding:1em; --vertical-padding:.75rem`
- Measured at 1440: bar x=240 w=950 h=39; columns 267.6px / 414.6px / 267.6px; font-size 12px.
- Focus mode (`useTest().focusMode`): opacity 0. Result shown (`state.finished`): every button disabled (opacity .33, pointer-events none).

### card (all three)
- background: `--sub-alt-color` (#2c2e31); border-radius: `var(--roundness)` (8px); padding: 0 `var(--horizontal-padding)` (0 12px at xl); height 39px
- left & mode cards: display block (buttons inline). right card: display grid, auto columns (grid-auto-flow: column).

### option button (use `.mt-button` from globals.css + overrides)
- padding: `var(--vertical-padding) var(--horizontal-padding)` (12px 12px at xl); gap .5em (6px); font-size inherits 12px; line-height 1.25 (15px); height 39px
- color sub #646669; active option color main #e2b714 (add class `active`); hover → text #d1d0c5; active+hover → text
- icon `<Fa icon=...>` 15×15 (fa-fw = 1.25em)
- transition color/background/opacity .125s cubic-bezier(.4,0,.2,1)
- measured widths at 1440: punctuation 124.2, numbers 95.4, time 73.8, words 81.0, quote 81.0, zen 66.6, custom 88.2, "15" 38.4, "30" 38.4, "60" 38.4, "120" 45.6, tools 39

## States & Behaviors
### Per-mode content
| mode | left card | right card (default *) |
|---|---|---|
| time | punctuation, numbers (toggles) | `15` `30*` `60` `120` `[tools icon]` |
| words | punctuation, numbers | `10` `25` `50*` `100` `[tools]` |
| quote | punctuation, numbers **disabled** (opacity .33) | `all` `short` `medium*` `long` `thicc` `[search icon]` |
| zen | hidden: opacity 0 and width 0 (bar columns become 24px/auto/24px) | hidden (width 0) |
| custom | punctuation, numbers | `change` |
- Mode card buttons: `@ punctuation` (icon `at`), `# numbers` (icon `hashtag`), `time` (icon `clock`), `words` (icon `font`), `quote` (icon `quote-left`), `zen` (icon `mountain`), `custom` (icon `wrench`).
- Active determined from `state.config`: mode === btn; `time === n` (time mode); `words === n` (words mode); `quoteLength === q`; punctuation/numbers booleans.
- Clicks: mode → `setConfig({ mode })`; number → `setConfig({ time: n })` or `setConfig({ words: n })`; quote length → `setConfig({ quoteLength })`; punctuation → `setConfig({ punctuation: !p })`; numbers likewise. Tools/search/change buttons: no-op (custom input modals are out of scope).
- After any click, call `focusInput()` from `useTest()` so the user can type immediately.
- Option lists come from `MODE_OPTIONS` in `@/lib/typing` (`time`, `words`, `quote`).
- Hover: color sub → text (.125s).

### "test settings" button (below md only: `md:hidden`)
- `.mt-button` + `bg-sub-alt`, padding 8px 16px, gap 8px, font-size 16px, line-height 20px, radius 8px; centered (`mx-auto`); contents `<Fa icon="cog" fw={false}>` + "test settings". At 768: x=289,y=136, 181×36.
- Click: no-op (settings modal out of scope). Fades with focus mode (opacity 0) like the bar.

## Text Content (verbatim)
punctuation, numbers, time, words, quote, zen, custom, 15, 30, 60, 120, 10, 25, 50, 100, all, short, medium, long, thicc, change, test settings

## Responsive Behavior
- ≥849px: bar visible; sizes scale through the CSS vars above.
- <849px: bar hidden, "test settings" button shown.

## Imports available
- `useTest` from `@/components/TestProvider` → `{ state: { config, finished }, focusMode, setConfig, focusInput }`
- `MODE_OPTIONS` from `@/lib/typing`; types from `@/types/test` (`Mode`, `QuoteLength`)
- `Fa` from `@/components/icons`; `cn` from `@/lib/cn`
