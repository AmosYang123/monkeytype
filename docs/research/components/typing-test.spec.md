# TypingTest (+ Words, Caret) and CookieModal Specification

## Overview
- **Target files:** `src/components/TypingTest.tsx`, `src/components/Words.tsx`, `src/components/CookieModal.tsx`
- **Screenshots:** `desktop-1440.png` (unfocused/blurred), `desktop-1440-focused.png`, `desktop-1440-typing.png`, `desktop-1440-initial-cookie-modal.png`
- **Interaction model:** keyboard-driven (hidden textarea) + time-driven counter. Built in-house (tightly coupled to `TestProvider`).

## TypingTest DOM (1440)
`div#typingTest` (content column, 1280 wide, x=75, y=315; font-size 32px, line-height 40px; `.content-grid` nested → inner content 1216 at x=107)
1. Language row `div.flex flex-wrap justify-center gap-x-4 text-base text-sub transition-opacity duration-125 select-none` (16px/24px, height 36). Button `.mt-button gap-3 h-full` (padding 8px, gap 12px, 16px/20px) `<Fa icon="globe-americas" fw={false}>` (15.5×20) + "english". Focus mode → opacity 0.
2. Counter holder: zero-height div; counter `div` color main, 32px/32px, `margin: -40px 0 0 8px`; text from `useTest().counter` (null → render nothing). Position at 1440: x=83, y=311.
3. `div#wordsWrapper.full-width` relative, height 156px, `overflow: visible clip` (overflow-x visible, overflow-y clip).
   - `textarea#wordsInput` absolute top 9 left 10, 38×32, opacity 0, z -1, autocomplete/autocorrect/autocapitalize off, spellCheck false. Handlers: onKeyDown → `useTest().onKeyDown`; onFocus/onBlur → `setInputFocused`. `ref={inputRef}`.
   - Focus overlay (when `!inputFocused && !finished`): absolute inset-0 z-[999] flex items-center justify-center gap-2, 16px/24px, color text. `<Fa icon="mouse-pointer">` + "Click here or press any key to focus". Click → `focusInput()`.
   - `#caret`: absolute, bg caret color, radius var(--roundness), width .1em (3.2px), height 1.2em (38.4px), font-size 2rem. Idle: `animation: caretFlashSmooth 1s infinite`. While typing (key within last 1000ms): animation none, opacity 1. Hidden when input not focused. Position: `left = letter.left - wrapper.left - caretW/2`, `top = letter.top - wrapper.top + (letter.h - caretH)/2`; after the last typed letter use the letter's right edge. Transition `left .1s ease-out, top .1s ease-out` (site tweens ~100ms via JS).
   - `#words` (full width 1280): flex wrap, align-content flex-start, padding-bottom .5em, user-select none. Unfocused: opacity .25, `filter: blur(4px)`, transition .25s.
     - `.word` margin .25em .3em (8px 9.6px), line-height 1em (32px), border-bottom 2px solid transparent, display block; `.word.error` (committed word with mistake, not the active word) border-bottom-color error.
     - `.letter` (span) inline-block, border-bottom .05em solid transparent; colors: untyped sub, correct text, incorrect error, extra error-extra.
4. Restart button `.mt-button mx-auto mt-4 w-max px-8 py-4 text-base` (padding 16px 32px, 84×52, margin-top 16px), `aria-label="Restart Test" data-balloon-pos="down"`, `<Fa icon="redo-alt">` (20×20). Click → `restart()`. Focus mode → opacity 0. Tab from the textarea lands here; Enter clicks it (native).

## Line scrolling
Render words from `firstVisible` index. After each change (layout effect): if the active word's offsetTop is on the 3rd line or lower (offsetTop ≥ first.offsetTop + 2 × lineStep), advance `firstVisible` to the first word of line 2. Reset `firstVisible` to 0 on reset.

## Zen mode
Targets = what the user typed; render committed inputs as fully-correct words + the active input.

## CookieModal
Fixed overlay `inset-0 z-[1000] flex items-end justify-end p-8 bg-black/50` shown after mount when `localStorage.cookieConsent` unset. Card `max-w-[500px] w-full grid gap-4 rounded-[16px] bg-bg p-8 text-text ring-4 ring-sub-alt` (500×292 at 1440, x=898,y=576):
- `h3.flex items-center gap-[.5em] text-2xl text-sub` (24px/32px): `<Fa icon="cookie-bite" fw={false}>` (24×24) + "We use cookies by the way"
- `div.grid gap-4`: text "Cookies enhance your experience and help us improve our website." (16px/20px), then `div.grid gap-2` of 3 buttons (436×36, padding 8px, radius 8px, flex center, transition color/background/opacity .125s cubic-bezier(.4,0,.2,1)):
  - "accept all": bg main, color bg
  - "reject non-essential": bg sub-alt, color text
  - "more options": bg sub-alt, color text
  - hover (all): bg text, color bg
- Any button → store choice, close.
