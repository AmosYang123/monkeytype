# Verification — October 11, 2026

## Automated

- Node test suite: 66 tests pass (31 tests before continuation).
- Production build: passes, with all application routes generated.
- TypeScript: passes through production build and independent checks.
- ESLint: zero errors; three existing unused-variable warnings in theme boot files, including old worktree copies.
- React/TypeScript reviews completed. Fixed stale language reset state, lazy-mode visual mismatch, tape reset/dependencies, theme favorite keyboard access, theme input labels, and setting hash destinations.

## Browser checks

- Compared live test-page layout with existing clone and original extraction specs.
- Settings search filters controls; all eight groups render.
- Escape opens command palette; theme sublist/select works.
- Theme favorites toggle with Enter using native sibling buttons.
- Custom text applies `alpha beta`; correctly typing it produces 100% accuracy and 10 correct characters.
- Repeat returns the same text; word history shows the typed words.
- Mobile test-settings modal opens.
- Weekly leaderboard selector updates URL and heading.
- Fresh leaderboard load has no browser errors after deterministic hydration fix.
- Desktop screenshots saved for test/settings/leaderboards/about/login; mobile screenshots saved for the same pages. Final desktop viewport 1440×900, mobile 390×844.
- Mobile settings and leaderboard document widths fit the viewport. Wide leaderboard table scrolls inside its container.

Screenshots are in `docs/design-references/`. No external forms were submitted, no accounts created, and no public deployment performed. Existing worktrees were preserved. The final result requires the frontend checkpoint in the clone skill before backend work.

## Typing correctness regression pass

Reproduced dropped first keystroke by loading the test, pressing the first displayed letter on the page body, then reading letter classes. Before the fix that letter remained untyped. Native focus key now reaches the shared typing handler exactly once. Unit regression tests cover forwarding order and exclusions for interactive targets and shortcuts.

Browser checks performed against localhost:3456:
- Focus with the first displayed letter, finish the word: every letter correct.
- Enter a wrong letter, Backspace, type the expected word: error removed.
- Complete 25 words, including scrolling from index 0 to index 10: 100% accuracy, 131/0/0/0 characters.
- Restart and repeat: new textarea is focused and previous inputs cleared.
- Zen text and Shift+Enter: result produced.
- Complete a test with a mistake, open practice, close its dialog: textarea focused; correct practice scores 100%.

Fixed modal focus timing for practice, custom text, and custom test amounts using AnimatedModal.afterHide. Build and 68 unit tests pass. ESLint has no errors and three pre-existing unused catch-variable warnings in theme-boot.js copies. Mobile IME, all languages, and every settings combination are not covered by this pass. Screenshot: ../design-references/typing-correctness-result.jpg.

## Large language and asset audit
Bundled all24 formerly proxied dictionaries; all446 selectable dictionaries validate and returnHTTP200. All239 layouts and87 quote files parse correctly; footer policy documents exist. Legacy english_450k APIredirect verified200; unknownlanguage404. All73tests and productionbuild pass. Browser confirms english450k renderedwords and8correct/0incorrect letters. Rebuilt generated devcache after a staleworker failure and clientreloadloop. Full settings permutations and mobileIME remain unchecked.
