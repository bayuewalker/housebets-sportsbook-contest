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
| Public Pages URL | PASS on 2026-11-07 (WIB): live without login; manifest and four served assets match publishing release |

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


## 2026-11-07 public deployment and desktop QA (WIB)

Deployment blocker resolved: the owner changed Pages from `main` / (root), which served uncompiled source HTML, to `gh-pages` / (root). `pnpm pages:verify` passed against source `e62bab273940f32d02aebc894db44c4f5888e822` and publishing commit `ad56245f919656cec22707e6c256bcc19cffe8f8`. This section supersedes earlier publication blockers; it does not claim that the earlier custom CI runs passed.

Public browser viewport: 1363×936 CSS pixels, document client/scroll width 1348px. Exact-width 1440px / 390px and physical-device tests were not repeated in this pass.

| Public scenario | Observed result |
| --- | --- |
| Five linked views | PASS — Sports Home, Live, Football, Match Center, combined Betslip + My Bets |
| Stake and quote acceptance | PASS — 25 × 1.48 = 37; changed 1.60 blocked placement until acceptance; then return 40 |
| Suspension and reopen | PASS — selection preserved; odds and placement disabled; reopen restored controls |
| Failure and retry | PASS — failure kept balance 1,000; retry created one 25-USDT single and balance 975 |
| Cash out | PASS — confirmation returned 23; balance 998; record appeared in Settled |
| History keyboard navigation | PASS — ArrowRight moved from Settled to Cash Out and updated content/focus |
| Refresh persistence | PASS — balance 998 persisted; quote scenarios reset as designed |
| Football and home navigation | PASS — all five leagues present; LaLiga filter isolated its fixture; Sports Home restored All sports |
| Player search and empty state | PASS — Bukayo matched Premier League fixture; unknown text showed zero results and Clear filters |
| No-live fallback | PASS — Live showed Starting Soon; Match Center displayed dashes, upcoming time and pre-match labels |
| Corrected live goals markets | PASS — Popular line 3.5, Goals line 4.5 and Next goal visible |
| Reset | PASS — explicit reset confirmation restored sample history and balance 1,000 |

Screenshot: `docs/screenshots/public-match-desktop.jpg`. Browser-extension metadata errors appeared in the captured console log; they are not reported as application errors. This was a focused smoke test, not a claim that every control or browser was retested.


## 2026-11-07 specification audit

Reran 21 behavioral tests, ESLint and production build (including TypeScript): all passed. Compared source to every requirement in the owner-supplied official screenshots; see `REQUIREMENTS_AUDIT.md`. Application files were unchanged. Final 390px/1440px browser regression could not be completed after the supported preview runtime was interrupted and a browser security-policy rejection prevented further inspection. Earlier desktop/mobile evidence is retained with its original scope; no new exact-width pass or screenshot is claimed.


## 2026-11-07 public control sweep and usability fix

- Reinstalled with `pnpm install --frozen-lockfile`: passed; supply-chain lockfile verification covered 193 entries. Reran the 21 behavioral tests, ESLint and TypeScript/Vite build after the usability fix: all passed.
- On the public desktop release, clicked all six Match Center category tabs. Each rendered its intended markets, including the goals, halves, handicaps, goalscorers and corners/cards groups.
- Repeated moved-odds acceptance, suspension/reopen, failed placement/retry, cash-out confirmation, Loading and No Live states. The failed placement left the sample balance at 1,000 USDT; the successful retry of a 10-USDT single reduced it to 990 USDT; cashing that bet out at 9.20 USDT restored 999.20 USDT.
- Found and fixed a UX snag: arming Fail next placement now closes the Demo controls dialog, consistent with the other scenario buttons. This behavior was confirmed on the updated public release; the dialog count dropped to zero and a toast confirmed the armed scenario.
- The cloud browser could inspect the hosted desktop site, but not set the exact 1440px/390px viewports or reach the local preview. Local Chromium startup was blocked by the browser process security policy. These exact-width passes remain open; no new responsive screenshot was captured.
- A follow-up public browser sweep on the new release confirmed scenario settlement with credited return, reset confirmation restoring 1,000 USDT, all four individual sports and All sports (6/1/1/1/9 fixture rows), every competition filter (2 Premier League, 1 each for the other seven), remove and Clear all, plus close-button and Escape dismissal.
- `pnpm pages:verify` passed: all four served assets matched executable source `694b3ad47b8efade6b4fedd89bd69221d60a7e73` and publishing commit `00de1670c55929ee5917fa08f06d32d40ff5e794`.
- Remaining: final 390px/1440px viewport validation and mobile interaction regression, official starter shell/brand pack. No physical-device, multi-browser or accessibility-conformance claim is made.
