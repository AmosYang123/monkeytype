# Frontend checkpoint limits

- Accounts: registration/login validate locally and show an unavailable notice; saved results and account pages need the backend stage.
- Leaderboards/About: rankings and aggregate statistics use sample data; no live Monkeytype account data is copied.
- Languages: all 446 dictionaries are bundled locally, including the largest lists.
- Funboxes: twenty local transformations/effects work; other specialized or remote-source modes display an unavailable notice.
- Keyboard/sound/pacer: specialized keyboard shapes and synthesized tones are approximations; only a custom-speed pacer works, with simplified styling.
- Advanced typing/display: hard deletion and flexible burst use simpler rules; lazy mode handles case only; timer variants and speed-unit displays are simplified.
- Result exports: replay and screenshot export are omitted; sharing copies test settings rather than a result image.
- Visual parity: desktop/mobile screenshots and core flows were checked; exhaustive interaction and animation parity remains for user review.

Existing reference specs and source ports guided the implementation. These limitations are explicit review items, not claims of complete one-to-one parity.
