# Header + MerchBanner Specification

## Overview
- **Target files:** `src/components/Header.tsx`, `src/components/MerchBanner.tsx`
- **Screenshots:** `docs/design-references/desktop-1440.png` (idle), `docs/design-references/desktop-1440-typing.png` (focus mode), `docs/design-references/tablet-768.png`, `docs/design-references/mobile-390.png`
- **Interaction model:** static + hover; Header fades in focus mode (state from `useTest().focusMode`); banner click-to-dismiss.

## MerchBanner
DOM: `div.fixed top-0 left-0 z-[1000] w-full` > `div.content-grid w-full bg-main text-bg` > `div.flex w-full justify-between gap-2` (in content column) containing:
1. `<img src="/images/merch2.png" alt="Banner Image">` — width 216px, height 36px, max-width 100%, align-self center. Only visible at ≥ xl (1361px): `hidden xl:block`.
2. `<Fa icon="shopping-bag">` — 20×16, align-self center. Visible below xl only: `xl:hidden`.
3. Text `div.self-center p-2` (padding 8px, 16px/20px font, color bg #323437): `Check out our merch store! ` + `<a href="https://mktp.co/merch" target="_blank" rel="noopener">monkeytype.store</a>` — link color bg (#323437), underline, `display:inline-block`, hover color `--text-color` (#d1d0c5), transition color .125s.
4. Close button: `button` 36×36, padding 8px, margin-right -8px, radius 8px, color bg, hover color text, transition `background .125s, color .125s, opacity .125s`, contains `<Fa icon="times">` (20×20, line-height 20px).
Heights: 36px desktop. At 390px the text wraps to two lines → banner 56px tall (text block padding 8 + 2×20 lines).
Behavior: close → hide banner (state persisted in `localStorage["merchBannerClosed"]="1"`, read in useEffect; wrap storage in try/catch). Expose the banner's current height so the app can pad: implement as: MerchBanner sets CSS var `--banner-height` on `document.documentElement` via ResizeObserver on its root (0px when closed). Page uses `padding-top: calc(var(--banner-height, 0px) + 2rem)`.
Also render the accent strip: `div.fixed top-0 left-0 -z-10 h-2 w-screen bg-main` (8px, sits behind; visible only after banner closed). Put it in MerchBanner.tsx as a sibling.

## Header
Root: `header.flex items-center gap-2` (gap 8px), height 36px, in content column (1280px wide at 1440, x=75).

### Logo link `a[href="/"][aria-label="Monkeytype Home"]`
- `-m-2 flex h-6 w-max gap-2 rounded-[0.8rem] p-2` → padding 8px, margin -8px, height 24px content, gap 8px, radius 12.8px, font-family `"Lexend Deca", sans-serif` (use `font-lexend`), color sub.
- `<LogoIcon>` from `@/components/icons`: 40×24 (`h-full`), `fill-current`, color `--main-color`; transition colors .25s. In focus mode color → `--sub-color`.
- Text block `div.hidden sm:grid h-6 place-content-center text-[2rem] leading-0` (font-size 32px, width ≈192.5px):
  - `div` "monkey see": `-mt-[1.65em] hidden lg:block pl-[0.5em] text-[0.315em] leading-0 text-sub transition-colors duration-125` → font-size 10.08px, padding-left 5.04px, margin-top -16.632px, color #646669. Focus mode: `text-transparent`.
  - `h1` "monkeytype": `-mt-[0.11em] text-text transition-colors duration-250` → margin-top -3.52px, color #d1d0c5, 32px Lexend Deca, line-height 0 (inherits). Focus mode: color `--sub-color`.
- Rendered positions at 1440: svg [75,74 40×24], text block [123,74 193×24], "monkey see" top at y≈69, h1 baseline so its glyphs span y≈70–100.

### Nav `nav.z-[5] flex w-full items-center gap-1 md:gap-2` (gap 4px <849px, 8px ≥849px)
Items in order (each `.mt-button` 36×36 aspect-square, padding 8px (`p-[0.5em]`), radius 8px, color sub, hover text, transition color/background/opacity .125s cubic-bezier(.4,0,.2,1)):
1. `a[href="/"]` `<Fa icon="keyboard">` (icon 20×16, line-height 16px)
2. `a[href="/leaderboards"]` `<Fa icon="crown">`
3. `a[href="/about"]` `<Fa icon="info">`
4. `a[href="/settings"]` `<Fa icon="cog">`
5. `div.grow` spacer
6. `button` alerts `<Fa icon="bell">` (20×20)
7. `a[href="/login"]` `<Fa icon="user">` (regular weight — Fa handles it)
Links point nowhere real in the clone: use `href` values above but `onClick={e => e.preventDefault()}` for all except `/` (which can be a plain `<a href="/">`).
Each nav item: `opacity: var(--nav-focus-opacity)`. Focus mode: Header sets `style={{"--nav-focus-opacity": focusMode ? 0 : 1}}` on `header` (cast style as `React.CSSProperties`).
Note `.mt-button` already exists in globals.css (inline-flex, gap .5em, padding .5em, radius var(--roundness), color sub, hover text, active sub, transitions). Use it plus `aspect-square`.

## States & Behaviors
- **Focus mode** (trigger: typing; from `useTest().focusMode`): nav items opacity 1→0 (.125s), logo svg main→sub (.25s), h1 text→sub (.25s), "monkey see" sub→transparent (.125s).
- **Hover:** nav items sub→text, .125s.

## Text Content (verbatim)
"monkey see", "monkeytype", "Check out our merch store! ", "monkeytype.store"

## Responsive Behavior
- ≥1361 (xl): banner shows merch image, 36px tall.
- <1361: shopping-bag icon replaces image.
- <1105 (lg): "monkey see" hidden.
- <721 (sm): logo text hidden (only svg).
- <849 (md): nav gap 4px.
- 390px: banner text wraps → 56px.

## Imports available
- `useTest` from `@/components/TestProvider` (returns `{ focusMode, ... }`)
- `Fa`, `LogoIcon` from `@/components/icons`
- `cn` from `@/lib/cn`
- Tailwind v4 theme colors: `bg-bg bg-main text-sub text-text text-main bg-sub-alt`, `font-lexend`, breakpoints xs/sm/md/lg/xl/2xl (426/721/849/1105/1361/1617).
