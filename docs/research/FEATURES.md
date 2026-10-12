# Frontend feature map

| Page | Control | Local behavior / data | Evidence |
| --- | --- | --- | --- |
| All | Header navigation | Navigate to test, leaderboards, about, settings, login | Live header links |
| All | Theme/footer/palette | Select preset/custom theme; preview, favorites, automation | Existing config metadata and recovered theme port |
| All | Contact/support/version/bell/cookies | Open shared dialogs; browser-only preferences and notices | Existing source ports |
| Test | Time/words/quote/custom/zen | Restart with selected mode; saved browser config | Live test bar, original source specs |
| Test | Language | Load vendored list; large lists use allow-listed proxy | Existing assets/language loader |
| Test | Custom duration/amount | Validate bounded whole numbers; zero means infinite | Test options source conventions |
| Test | Custom text | Edit, save/load, generate text and configure limits | Custom-text store and original handoff |
| Test | Quote search | Filter quotes and start selected quote | Vendored quote datasets |
| Test | Typing/results | Input history, speed/accuracy/chart, retry and practice | Reducer tests and original result extraction |
| Test | Share settings | Copy local URL; validate imported settings | Allow-listed URL helper tests |
| Settings | Search/group navigation/collapse | Filter original metadata and show controls | Vendored metadata and settings screenshot |
| Settings | Configuration | Sanitize and persist local settings; engine and display subscribe | Existing config store |
| Settings | Import/export/reset | JSON settings file/string and reset confirmation | Original metadata |
| Leaderboards | View/language/page/countdown | URL-backed state with deterministic sample rows | Existing leaderboard port/tests |
| About | Contributors/supporters | Read vendored datasets | Existing JSON files |
| Login | Forms | Validate locally; display account-unavailable notice | Existing validators/tests |

Server accounts and live global statistics are deferred to the backend checkpoint. See `ASSUMPTIONS.md` for known fidelity limits.
