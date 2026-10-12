# Monkeytype local clone

Local frontend recreation of [Monkeytype](https://monkeytype.com/), continued from the existing Claude checkout. Source ports, text, fonts and assets are derived from [monkeytypegame/monkeytype](https://github.com/monkeytypegame/monkeytype), created by Miodec and contributors. The upstream GPL-3.0 license is included in LICENSE.

## Run

```powershell
npm install
npm run dev -- --port 3456
```

Open http://localhost:3456. If Next reports an existing server for this directory, use the URL it prints.

## Check

```powershell
npm test
npx tsc --noEmit
npm run build
```

The tests use Node's built-in test runner with native TypeScript support.

## Frontend scope

Typing test, settings, command palette, themes, custom text, quote search, notifications, static legal pages, about, login forms and sample leaderboards. Settings and custom text are saved in browser storage. Accounts are unavailable; login forms only validate and show a notice. Leaderboards and aggregate statistics contain sample data. No ad network is connected.

All 446 language dictionaries, including the large lists, are bundled locally. Language selection does not require an upstream request. Legacy large-language API URLs redirect to the local files.

See docs/research/PAGES.md, FEATURES.md, ASSUMPTIONS.md and VERIFICATION.md for coverage, known limits and checks. The frontend checkpoint precedes backend implementation.
