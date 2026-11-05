# HOUSE//LIVE QA Report

## Scope and environment

Frontend-only prototype. Data flow: UI action → in-memory state transition → validation/calculation → DOM feedback and local demo history. There are no backend, database, payment or betting API boundaries.

Local testing used Node.js 24, TypeScript 5.9.3, Vite 8.0.13, ESLint 9.39.4 and Chrome. Browser viewport checks used an iframe harness at 1440×1000 and 390×844 CSS pixels; these are responsive-layout checks, not physical-device emulation. Native scrollbars reduce document client width by 15px. No page-level horizontal overflow was observed in the checked layouts.

## Automated checks

| Check | Last recorded result |
| --- | --- |
| TypeScript | PASS |
| ESLint | PASS |
| Node behavioral tests | 17 passed, 0 failed |
| Vite production build | PASS |
| Hosted GitHub Actions | NOT RUN — initial source push pending |
| Public Pages URL | NOT DEPLOYED |

Behavioral coverage: decimal returns; independent singles; selection removal; quote-change blocking; repeat quote acceptance; suspension/reopening; disabled suspended markets; failure without balance/history mutation; successful retry; invalid stakes and precision; valid boundaries; aggregate balance limits; idempotent cash out; settlement crediting; search dimensions; required leagues/categories; invalid selections; final transaction revalidation.

## Browser evidence recorded 2026-11-05

| Scenario | Result / evidence |
| --- | --- |
| Sports Home → Match Center | PASS — Arsenal v Brighton and all six category controls visible |
| Desktop stake calculation | PASS — 25 × 1.48 = 37.00 USDT |
| Changed odds | PASS — 1.48 → 1.60; Place disabled until explicit acceptance |
| Accepted return | PASS — 25 × 1.60 = 40.00 USDT |
| Suspension | PASS — pick retained and placement disabled; reopening restored availability |
| Failed placement | PASS — error displayed; balance stayed at 1,000.00 USDT |
| Retry success | PASS — one 25 USDT debit; balance 975.00; one new open bet |
| Cash out | PASS — confirmed 23.00 return; balance 998.00; record moved to Settled |
| Football league coverage | PASS — Premier League, Champions League, LaLiga, Serie A, Bundesliga |
| Tomorrow filter | PASS — Dortmund v Leverkusen only |
| Competition filter | PASS — LaLiga fixture only |
| Player search | PASS — Bukayo returned Arsenal fixture |
| No-result search | PASS — useful empty state and Clear filters |
| Following | PASS — Bundesliga toggle reflected in Following results |
| No-live scenario | PASS — Starting Soon fallback displayed |
| Reset | PASS — home and sample session restored |
| Mobile sheet | PASS — persistent bar opened an interactive betslip |
| Mobile calculation/placement | PASS — 50 × 1.48 = 74.00; successful receipt |

## Fixes found during QA

- Scoped stake input IDs by surface to avoid duplicates between the rail, combined page and mobile sheet.
- Preserved focus on the visible modal input after stake edits.
- Corrected the mobile hero line break.
- Added dark native scrollbars.
- Preserved search across a route change.
- Made the skip link focus main content without changing the hash route.
- Switched Vite to relative asset paths for GitHub project Pages.

## Remaining verification limits

- Relative-path production build and final mobile stake-focus regression passed. Desktop Match Center and mobile betslip screenshots are saved in `docs/screenshots/`.
- Desktop screenshot includes the viewport QA toolbar; mobile screenshot is cropped to its 390×844 frame.
- No public deployment, hosted CI result, Safari/Firefox run or physical-device keyboard test is claimed.
- No full screen-reader audit or WCAG conformance claim is made.
- The official starter shell and brand pack have not been inspected; brand compliance remains provisional.
- Normal registry installation was restricted in the execution environment; local checks used matching package versions from the provided toolchain cache. A clean install must pass in GitHub Actions.
- Google Fonts requires an external request; system fonts provide a functional fallback.
