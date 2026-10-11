# Footer + CommandLineFab Specification

## Overview
- **Target files:** `src/components/Footer.tsx`, `src/components/CommandLineFab.tsx`
- **Screenshots:** `docs/design-references/desktop-1440.png` (footer y=785–876), `docs/design-references/tablet-768.png`, `docs/design-references/mobile-390.png`
- **Interaction model:** static + hover; fades out in focus mode (`useTest().focusMode`).

## Footer DOM + styles (1440)
`footer.relative text-xs text-sub` → font-size 12px, line-height 16px, color #646669. Width = content column (1280 at 1440, x=75). Height 91.

### Row A — key hints `div.mb-8 flex flex-col items-center gap-2 transition-opacity duration-250` (margin-bottom 32px, gap 8px, height 40)
- line 1 `div.flex items-center gap-2`: `<kbd>tab > enter</kbd>` `<span>- restart test</span>` (x=630..800)
- line 2 `div.flex items-center gap-2`: `<kbd>escape</kbd>` text ` or ` `<kbd>ctrl + shift + p</kbd>` `<span>- command line</span>` (x=577..854)
- kbd (global style exists in globals.css): font-size 9px (.75em), line-height 12px, padding 1.8px 3.6px (.2em .4em), radius 2.25px (.25em), color bg #323437, background sub #646669, font-family ui-monospace stack. Rendered 15.6px tall.
- Focus mode: opacity 0 (transition opacity .25s cubic-bezier(.4,0,.2,1)).

### Row B — `div.-m-2 flex justify-between gap-8 transition-opacity duration-250` (margin -8px, gap 32px, height 27). Focus mode: opacity 0.
Left group: `div.grid grid-cols-1 justify-items-start xs:grid-cols-2 sm:grid-cols-4 lg:flex`
Each item = `.mt-button` with: font 12px, line-height 15px (1.25), padding 6px (.5em), gap 6px, radius 8px, height 27px; icon `<Fa>` 15px wide. Hover sub→text .125s.
1. `button` `<Fa icon="envelope">` contact (83.4 wide)
2. `button` `<Fa icon="donate">` support (83.4)
3. `a href="https://github.com/monkeytypegame/monkeytype" target=_blank rel="noreferrer noopener"` `<Fa icon="code">` github (76.2)
4. `a href="https://www.discord.gg/monkeytype"` `<Fa icon="discord">` discord (83.4)
5. `a href="https://x.com/monkeytype"` `<Fa icon="twitter">` twitter (83.4)
6. `a href="/terms-of-service.html"` `<Fa icon="file-contract">` terms (69)
7. `a href="/security-policy.html"` `<Fa icon="shield-alt">` security (90.6)
8. `a href="/privacy-policy.html"` `<Fa icon="lock">` privacy (83.4)
(Buttons/terms/security/privacy: `onClick` preventDefault — no pages exist. External github/discord/x links real.)
Right group: `div.flex flex-col items-end text-right lg:flex-row`
1. `button` aria-label "Shift-click to toggle custom theme" `data-balloon-pos="left"`, `align-items: baseline`: `<Fa icon="palette">` + `<div>serika dark</div>` (112.2 wide)
2. `button` `align-items: baseline`: `<Fa icon="code-branch">` + `<div>v26.32.0</div>` (90.6 wide)
Both no-op on click.

## CommandLineFab
- `button.fixed bottom-8 left-8 z-[99] hidden pointer-coarse:grid h-12 w-12 rounded-full bg-main text-bg place-items-center` (48×48 at x=32,y=bottom-32), contains `<Fa icon="terminal">` 16px, color bg #323437. aria-label "command line". No-op click. Only visible on touch devices (`@media (hover:none) and (pointer:coarse)` — Tailwind v4 variant `pointer-coarse:` is fine, or write the media query).

## States & Behaviors
- **Focus mode:** rows A and B opacity 1 → 0, transition opacity .25s cubic-bezier(.4,0,.2,1).
- **Hover:** each item sub → text, transition color .125s; tooltip on theme button (balloon CSS in globals.css handles it via aria-label + data-balloon-pos).

## Text Content (verbatim)
"tab > enter", "- restart test", "escape", "or", "ctrl + shift + p", "- command line", contact, support, github, discord, twitter, terms, security, privacy, "serika dark", "v26.32.0"

## Responsive Behavior
- ≥1105 (lg): left links one flex row; right group row.
- 721–1104 (sm): left links grid 4 columns (2 rows); right group column (items-end).
- 426–720 (xs): 2 columns.
- <426: 1 column (at 390 the 8 links stack in 216px tall column, right group column at the right).

## Imports available
- `useTest` from `@/components/TestProvider` (→ `focusMode`)
- `Fa` from `@/components/icons`; `cn` from `@/lib/cn`; `.mt-button` class in globals.css
