# HOUSE//LIVE QA Report

## Scope and environment

Frontend-only prototype. Data flow: UI action → in-memory state transition → validation/calculation → DOM feedback and local demo history. There are no backend, database, payment or betting API boundaries.

Local testing used Node.js 24, TypeScript 5.9.3, Vite 8.0.13, ESLint 9.39.4 and Chrome. Browser viewport checks used an iframe harness at 1440×1000 and 390×844 CSS pixels; these are responsive-layout checks, not physical-device emulation. Native scrollbars reduce document client width by 15px. No page-level horizontal overflow was observed in the checked layouts.

## Automated checks

| Check | Last recorded result |
| --- | --- |
| TypeScript | PASS |
| ESLint | PASS |
| Node behavioral tests | 21 passed, 0 failed |
| Vite production build | PASS |
| Clean-directory frozen-lockfile install | PASS — isolated directory, pnpm 11.25.0; cached packages, esbuild postinstall executed |
| Hosted GitHub Actions | BLOCKED — account-level runner restriction confirmed by owner screenshot; latest inspected run 42080493828 failed |
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
- No successful public deployment or hosted validation is claimed. The first workflow failed before executing steps (empty steps API; missing log blob). Browser/terminal environment then became unavailable. Safari/Firefox and physical-device keyboard tests remain unperformed.
- No full screen-reader audit or WCAG conformance claim is made.
- The official starter shell and brand pack have not been inspected; brand compliance remains provisional.
- Dependency installation now succeeds with the committed exact-version esbuild build-script approval. Hosted installation remains unverified until the account restriction is resolved.
- Google Fonts requires an external request; system fonts provide a functional fallback.


## 2026-11-06 quality pass

- Corrected Arsenal's active total-goal lines to 3.5 and 4.5 at a 2–1 score. Replaced the already-decided both-teams-to-score market with odd/even total goals.
- Applied the no-live state to the hero, fixture cards, Match Center and betslip labels.
- Cleared the stale football filter when navigating back to Sports Home.
- Added complete session-schema validation; malformed/null/duplicate history restores the safe sample session.
- Added roving tab focus and Arrow/Home/End keyboard navigation to My Bets.
- Added four tests for refresh persistence, corrupt storage, malformed history and undecided live markets.
- Added explicit approval for esbuild 0.28.0 only. Clean installation and local checks are recorded separately from hosted CI.
- Moved Pages configuration into the deploy job so hosting setup is separate from code validation.

The updated browser scenarios are pending because the current preview could not be reached. Prior browser evidence above applies to the previous build. No new screenshot or screen-reader conformance claim is made.


## Branch publishing change

The owner requested Deploy from a branch. The custom Actions workflow is removed. `pnpm pages:prepare` validates and builds locally, then prepares `.pages/` with `.nojekyll` and a source-commit/SHA-256 manifest. Publish only this static output at the root of `gh-pages`. GitHub's own Pages deployment status must still be verified; branch mode is not claimed to resolve account-level restrictions.


## 2026-11-07 publication verification (WIB)

- Added `pnpm pages:verify`, a credential-free check that pins the current publishing commit, compares the hosted manifest, and verifies SHA-256 checksums of public assets. `.nojekyll` is a publishing marker, not a required public response.
- `node --check scripts/verify-pages.mjs`: PASS.
- Live verification: expected failure, HTTP 404 for the public `build-info.json`. No successful hosted release is claimed.
- Public repository API: no deployment records or new Pages run; the latest visible old custom run is `42134155517`. The cause of the absent branch deployment remains unconfirmed.
- No application behavior or generated release files changed in this follow-up. Earlier 21-test, lint and build results remain the evidence for the published source release; no additional browser QA or screenshots are claimed.
