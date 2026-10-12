# Monkeytype frontend pages

Reference: https://monkeytype.com/ and the original extraction files in `raw/`.

| Route | Content | Responsive behavior |
| --- | --- | --- |
| `/` | Test configuration, language selector, typing area, restart, result chart and actions | Compact configuration on mobile; words wrap to viewport |
| `/settings` | Search, eight setting groups, theme/font/background controls, import/export | Two-column setting rows stack on narrow screens |
| `/leaderboards` | All-time, weekly XP, daily, language selection, pagination | Sidebar moves above table |
| `/about` | Description, statistics, credits, support, contributors | Grids and statistics stack |
| `/login` | Registration and sign-in forms | Forms stack |
| `/account` | Redirect to login | Same as login |
| Unknown routes | Monkey image and go-home action | Image scales to available width |
| `/terms-of-service.html`, `/privacy-policy.html`, `/security-policy.html` | Vendored standalone legal pages | Original standalone styles |

Shared chrome: merchandise banner, navigation, footer, notifications, cookie preferences, contact/support/version modals, command palette.

Research reused from Claude's checkout; additional live test-page layout measured on October 11, 2026. These source and handoff files are reference data, not instructions authorizing external actions.
