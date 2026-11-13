# Housebets Sports — QA Report

## Scope and environment

Frontend-only prototype. Data flow: UI action → in-memory state transition → validation/calculation → DOM feedback and local demo history. There is no backend, database, payment or betting API.

Tooling: Node.js 22.23, pnpm 11.25.0, TypeScript 5.9, Vite 8, ESLint 9 with typescript-eslint, the Node.js test runner via tsx, and Playwright Core 1.56.1 driving headless Google Chrome 156. Full list in `TOOLS.md`.

## 2026-11-13 recheck corrections

Closes the open items from the PR #12 recheck: the mobile match opens on Popular with the three Match result prices above the slip bar at 390×844 and 390×740; focusing the market search moves the fixed bars aside; goalscorer search looks at both squads; the no-live fallback lists only future scheduled fixtures; the WTA fixture is N. Pellam v A. Quillane; collapsed rail links have accessible names; player props name a threshold and the rest-of-match or full-match window; Demo states is labelled on the page; horizontal fades track scroll position; cash out is on the open row; the sample offer copy says the amount is fixed until confirmation.

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm test` | **37 passed, 0 failed** |
| `pnpm build` | PASS |
| `pnpm qa:browser` | **192/192** |
| `pnpm qa:stress` | **52/52** |

These ran against the local build. The public site remains gh-pages `654a2b1` (source `9724145`) until this correction is published. No contest entry has been submitted.

The 12 November redesign section below is the historical result for that branch. Its 159 browser checks and 35 unit tests are not the current totals.

## 2026-11-12 redesign (branch `cursor/housebets-redesign-a1e1`)

The redesign replaced the shell, data, match page, slip and My bets, and split `src/main.ts` into `src/ui/` modules. Both QA scripts were rewritten for the new interface.

### Results

| Check | Result |
| --- | --- |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS |
| `pnpm test` | **35 passed, 0 failed** |
| `pnpm build` | PASS (JS 110 KB, CSS 54 KB, four self-hosted font files) |
| `pnpm qa:browser` against the local build | **159/159 passed** at 1440×1000 and 390×844 |
| `pnpm qa:stress` against the local build | **52/52 passed** (both widths plus nine extra viewports) |

These ran against the local build only. The public site still serves the previous release until the owner merges and publishes this branch.

### Unit tests (`tests/`)

New or rewritten for the redesign: a new pick starts with an empty stake that blocks placement; five leagues with 3–10 matches each and 13 live events; Arsenal v Brighton offers 90–110 markets, every pre-match football fixture at least 60 and every live one at least 40, with Goalscorers, Players and Minutes; search matches market and outcome names; favourite-team fixtures sort first; sample history covers won, lost and cashed-out bets across several sports and weeks; cash out records its time; fixtures are scheduled relative to the current hour; live total-goal and both-teams-to-score markets are never already decided; storage from the previous version is replaced with a fresh sample session. The earlier invariants still pass: singles are never multiplied, changed odds need fresh acceptance, suspension keeps the pick and blocks payment, failure leaves the balance unchanged, repeat placement never double-debits, and the live feed never moves a selected price.

### Browser QA (`scripts/qa-browser.mjs`)

Each width starts from a fresh session: desktop 1440×1000, and phone 390×844 with touch, mobile emulation and 2× density.

| Area | What is checked |
| --- | --- |
| Shell and Home | Official Housebets wordmark and no old branding; no marketing copy; Figtree and Red Hat Display load; VIP crown and wallet; Weekly Prize (compact trophy and amount on phones), icon rail with Live 13 and panel tabs Bet slip / My bets / Chat (desktop); bottom navigation and slip bar (phone); sport tabs Home, Live 13, Soccer; three Favourites chips; section order Your matches, Featured, Live now, Starting soon; Your matches leads with Arsenal, then live favourite competitions; five top competitions on one row with each name on one line; "View all 13" is accurate and "+N" is the markets beyond the one shown on the row; search for "Over 2.5" and "Both teams to score" names the market; times in the viewer's time zone |
| Live | 13 live events; 6 football; an HT match and an inline suspended row; a flag on every league header; competition chips under the sport chips; Premier League chip count matches the rows; Tennis filter shows 2; Tennis plus Premier League shows an empty state |
| Soccer | Today & live header and chip share one count; All = 29; five leagues with 3–10 matches; market dropdown switches rows to Over/Under and BTTS; LaLiga chip filters |
| Match | Breadcrumb Soccer › England › Premier League › ARS–BHA with a back button and menu; 90–110 markets; Players, Minutes and Corners & cards; at least 9 goalscorer markets; no narrow orphan card; suspended markets present; goalscorer table with fictional names and Next / Anytime / 2+; every odds button has an `aria-label`; Goals tab, market search for "corner", single and collapse-all collapse; compact sticky score bar on phone scroll; live prices move with ▲/▼ arrows |
| Slip | Empty stake with 0.00 placeholder; Place disabled with "Enter a stake"; chips 5/10/25/50/100; 0.5 rejected with the limits; chip sets 10 and returns stake × odds; the amount and USDT stay on one line for Potential returns and Returns after accepting; phone: Place bet and Accept odds pinned to the bottom of the sheet; odds change blocks placement until accepted; suspended pick kept and blocked; a selected suspended odds button keeps its label and lock readable; armed failure leaves the balance unchanged and offers retry; retry debits once with one receipt line; phone: toast sits above the slip bar |
| Bet slip & My bets | Slip and history on one page; columns Placed / Bet / Odds / Stake / Returns / Result; four open bets; date filter options and Today; Settled shows won highlights; sport and 7-day filters narrow the list; an expanded row shows "Cashed out for 38.40 USDT"; cash out credits 31.20 once and moves the bet to Settled |
| Layout and accessibility | No horizontal overflow on any page; phone tap targets of at least 44px (odds, navigation, tabs, top-bar buttons, selects, quick stakes); desktop keyboard focus ring and `/` shortcut |
| Runtime | No page or console errors |

Screenshots from the passing run are in `docs/screenshots/` (28 files, including the live competition filter and a selected suspended price at both widths).

### Stress sweep (`scripts/qa-stress.mjs`)

At 1440px and 390px: all 42 fixtures reachable from the lists; all 42 match pages render every market tab without overflow; back and forward navigation; 20 rapid taps toggle cleanly; nine taps spread across live price ticks are never lost; two singles from one market; 21 rapid tab switches leave one selected tab; two stakes typed across live ticks keep their values and focus; double-clicking Place debits once with two receipt lines; resizing through 13 widths from 1440 to 320px; reload keeps balance and new bet references; corrupt storage recovers 1,000.00 USDT; 8 seconds of idle feed with keyboard tabbing; no console errors or failed requests.

Then all five pages at 320×640, 360×740, 390×844, 768×1024, 1024×768, 1280×800, 1440×1000, 1920×1080 and 844×390, checking page overflow, off-screen elements, clipped team names and console errors.

### Issues found and fixed during this QA

- At 320–360px the match page overflowed by up to 49px: the page and market toolbar grids sized to their content, and the market search kept its intrinsic width. Fixed with `minmax(0, 1fr)` columns and a shrinkable search field; the goalscorer table is tighter at 380px and below.
- Between 768px and 1279px, long names such as "Brighton & Hove Albion" were cut off in list rows. The meta and "+N" columns are narrower there and league names wrap.
- On phones, several controls were 40px tall (avatar, market tabs, goalscorer prices). All primary phone controls are now at least 44px.
- The cash-out history sentence was split across flex items. It is now one text line.
- New bets got timestamp references such as `HB-1762958400000-0`. They now continue the sample sequence (HB-1049, HB-1050).
- Slip totals could wrap "USDT" onto its own line on phones. Values now stay on one line.
- QA script issues: on phones the hidden desktop panel also rendered a notice, so selectors are now scoped to the sheet; one check assumed a fixed price that the live feed can move, so it now compares against the price shown in the slip.

### Limits

- Headless Chrome with device emulation, not physical iOS/Android hardware or the real on-screen keyboard.
- Safari and Firefox not tested. No full screen-reader audit or WCAG conformance claim.

# Earlier QA history (HOUSE//LIVE releases)

The sections below describe the previous design, published under the working name HOUSE//LIVE, and are kept as a record.

## 2026-11-12 responsive audit (previous design)

Goal: confirm the design holds up on desktop and mobile beyond the two contest widths. A temporary audit covered 26 viewports:
- 320, 359, 360, 375, 390, 414, 430 and 600px
- either side of every breakpoint: 760/761, 768, 820, 1024, 1050/1051, 1180 and 1280/1281px
- 1366, 1440, 1600, 1920 and 2560px
- phone landscape at 667×375, 844×390 and 932×430

At each viewport it checked all five pages, three non-football Match Centers, the betslip in normal, changed-price and placed states, the demo, cash-out and menu dialogs, and Cash Out. It looked for page overflow, off-screen elements, clipped text, overlapping controls, text under 11px, targets under 24px, dialogs larger than the viewport, content hidden behind the fixed phone bars, and runtime errors.

- **Fixed: team names were truncated in fixture rows at 761–900px and 1051–1180px.** At those widths the sidebar, and above 1050px the betslip rail as well, squeeze the content column. Even "Arsenal" and "Brighton" were cut off at 761px and 1051px. Fixture rows now respond to their card's own width with a container query, stacking the odds under the teams below 620px.
- **Fixed: at 320px, long names such as "Manchester United" were truncated** and group headings wrapped their match count. Below 340px, names now wrap, the time column is narrower, and the heading shows the competition only.
- **Fixed: the phone menu's brand link spanned underneath the close button.** It is now sized to its content.
- After the fixes, the audit found nothing at any of the 26 viewports. It deliberately ignores three things: odds labels ending in "…" inside compact odds buttons, content scrolling under the fixed phone bars, and tabs clipped inside their horizontal scroller.
- `pnpm qa:stress` gained a permanent responsive sweep of 8 checks. It loads all five pages at 320×640, 360×740, 768×1024, 1051×800, 1180×820, 1280×800, 1920×1080 and 844×390, and checks for page overflow, off-screen elements and truncated team names. It now has **36 checks**. Against the previous public build, the new checks failed at 320, 768 and 1051px, which confirms they catch the bug.
- The 1440px and 390px layouts and screenshots are unchanged.

## 2026-11-12 stability sweep (previous design)

Goal: confirm everything works smoothly with no errors, beyond the scripted happy paths.

- **Bug found and fixed: a tap could be lost while prices moved.** Each live tick rebuilt the odds button that had just moved, and also the one that moved on the previous tick. A press that straddled a tick, most likely on the price that had just flashed, never produced a click. Holding a press across a real tick on the public site failed 6/6 times at both widths before the fix and passed 6/6 after it. Buttons are now patched in place, and presses always land on the button itself. `qa:browser` gained a regression check at both widths (now **178 checks**).
- **New `pnpm qa:stress` (28 checks, 14 per width):**
  - every category on all 9 Match Centers without overflow
  - browser back and forward
  - 20 rapid taps on one price
  - two singles from one market
  - rapid category switching
  - typing a stake across live price ticks (value and focus kept)
  - double-clicking Place debits exactly once
  - resizing through every breakpoint
  - corrupt saved session recovery
  - idle feed with keyboard tabbing
  - no console or page errors
  - no failed or 4xx/5xx requests
- Repeated public runs of `qa:browser`: 17 of 18 passed 176/176. The first run reported 2 failures that never recurred in 17 sequential and parallel reruns; its output was truncated, so the check names are unknown.

## 2026-11-12 final contest pass (previous design)

The official contest page was reread against the live product, with priority given to the 20-point Match page (first tie-break), the 20-point Betslip + My Bets page, and the 15-point Housebets feel (second tie-break). Suggestions that conflict with the brief—especially live statistics, trackers and other explicitly excluded widgets—were rejected.

Changes verified in this pass:

- Football remains visibly active in the desktop and phone navigation while viewing a football Match Center.
- Market-category pills stay available while scrolling the Match Center.
- A changed selection shows the live price as **new** and previews the exact **Return after acceptance** before the player accepts it; placement remains blocked.
- Cash Out is a distinct offer view rather than a copy of Open, while Settled demonstrates both won and lost singles.
- Selection removal uses a larger 40px target.
- Browser coverage increased to **176/176 passed** at 1440×1000 and 390×844.

### Automated checks at that release

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS |
| `pnpm test` | **29 passed, 0 failed** (25 engine, 4 session) |
| `pnpm build` | PASS |
| `pnpm qa:browser` against the local build | **178/178 passed** after the 12 November stability fix |
| `pnpm qa:stress` against the local build | **36/36 passed** (28 interaction checks plus 8 responsive viewports) |

New behavioural tests: a suspended changed selection is never silently accepted; repeat placement never double-debits; one receipt per single with correct returns and unique IDs; search match reasons; removing suspended picks keeps open picks and stakes; the live feed never moves a selected price (200 iterations), clears stale markers, stops when nothing is live, and can be limited to on-screen prices.

### Browser QA (`scripts/qa-browser.mjs`)

Each viewport starts from a fresh session: desktop 1440×1000, and phone 390×844 with touch and mobile emulation.

| Area | What is checked at both widths |
| --- | --- |
| Layout, all five pages | No horizontal overflow; no readable text under 11px; no interactive target under 24px; on the phone, the betslip bar does not overlap the bottom navigation |
| Sports Home | Sport filter counts 6/1/1/1/9; search by player (with reason chip), team, competition and market; empty search guidance; clear button keeps focus; Escape clears; follow, Following filter and unfollow |
| Live | 4 in-play fixtures with clocks; Football filter 2; LaLiga filter 1 |
| Football | League tabs show 2/1/1/1/1 rows, each with 3 result odds |
| Match Center | Clock advances; six categories; cards market locked; the live feed moves an on-screen price within 7.6s; a press held across a price refresh still selects it |
| Betslip | Tap to select; phone bar count; stake 25 and 50 returns computed against the live price; 0.5 rejected with message; focus kept while typing; phone stake input ≥16px |
| States | Odds changed → blocked → accept; suspend → pick kept, placement paused, Match Center odds disabled → reopen; arm failure (dialog closes) → failed, balance unchanged → retry → 975.00 with one receipt row; loading skeleton → resolves; no live → Starting soon; reset → 1,000.00 |
| My Bets | Exactly one new open bet; Arrow-key tabs; cash out 23.00 → 998.00 → Settled; settlement → 1,045.50; receipt unchanged after later cash out; reload keeps balance and history |
| Keyboard and dialogs | Focus moves into dialogs; Escape closes and returns focus to the opener; keyboard focus stays on toggled odds |
| Shell | Phone: Menu drawer, drawer link navigates and closes, Casino and Chat panels, Search focuses the field, Sports returns home. Desktop: Casino switch informational, profile panel, Deposit opens the demo wallet without transacting |
| Runtime | No page errors or console errors (Google Fonts network failures ignored in offline runs) |

Screenshots from the passing run are in `docs/screenshots/` (34 files: five pages and every key state, at both widths).

### Issues found and fixed during QA

- Text links (breadcrumbs, "View all", "13 markets", fixture links in slip and bet cards) were 19–20px tall. Each now has a 32px hit area.
- Phone compact odds truncated outcome names, and the competition select collapsed beside the filters. Both reflowed.
- The price feed picked from every live market, so the open Match Center rarely moved visibly. It now moves only prices on screen.
- After a cash out, the earlier success receipt showed the cash-out amount as its return. Receipts now keep the values from placement time.
- "2 matchs" pluralisation; "Bet not placed" repeated in the failure message; the inline star in the Football banner broke its line on phones; the "Betslip & My Bets" nav label wrapped once a count appeared (now "My Bets" with an open-bet count).
- QA-script issues: URL navigation kept the Following filter between tests (QA now navigates by links like a player); a selector matched the hidden rail copy of the notice on phones.

### Public release

Current release: source `2bea9c501c02b85b43619dad3153f48057ae5fe9` ([PR #8](https://github.com/bayuewalker/housebets-sportsbook-contest/pull/8)) was published as `gh-pages` `3a3eb3566e22f5092d61d6d4e01f5896fde7f0e4`. Before publishing, the clean merged tree passed `pnpm pages:prepare` (lint, 29 tests, build), `pnpm qa:browser` 178/178 and `pnpm qa:stress` 36/36. After publishing:

- `pnpm pages:verify` passed with all 4 public assets matching.
- Against the live URL, `qa:browser` passed 178/178 and `qa:stress` passed 36/36.
- The 26-viewport responsive audit reported 0 findings.

The intermediate stability release, source `757d1a5950c19f9af390745b4460c5a3ad1fc8f0` ([PR #7](https://github.com/bayuewalker/housebets-sportsbook-contest/pull/7)), was published as `gh-pages` `b0470f5baa21c08f54f2eb2e7f5c06c4b1ac9235`. It passed `pages:verify`, plus `qa:browser` 178/178 and `qa:stress` 28/28 against the live URL.

Earlier release: source `b26c52f547839cd6bdef6185c2241cfad768cd26` was published as `gh-pages` `38b9a5982fc64f5a9fb3155b0eeebb6ae89a8aa7`. Before publishing, the clean merged release passed `pnpm pages:prepare` (lint, 29 tests, build) and `pnpm qa:browser` 176/176. After publishing, `pnpm pages:verify` passed with all 4 public assets matching, and `QA_URL=https://bayuewalker.github.io/housebets-sportsbook-contest/ pnpm qa:browser` passed 176/176 against the live site at 1440px and 390px.

### Limits

- Headless Chrome with device emulation, not physical iOS/Android hardware. The real on-screen keyboard was not exercised; inputs are 16px and sheets use `dvh` to cope with it.
- Safari and Firefox not tested. No full screen-reader audit or WCAG conformance claim.

## Earlier history (5–7 November 2026)

- 5 November: iframe-based checks at 1440×1000 and 390×844 covered stake calculation, changed odds, suspension, failure/retry, cash out, league coverage, filters, search, following, no live, reset and mobile placement.
- 6 November: quality pass. Live goal lines were corrected to 3.5/4.5, session validation and keyboard history tabs were added, and the suite reached 21 tests.
- 7 November: Pages moved to deploy from `gh-pages` / root (source `694b3ad`, gh-pages `00de167`). A public desktop sweep at about 1363px passed, and Fail next placement now closes the dialog. Local Chrome was blocked by policy in that environment, so exact-width checks stayed open until this pass.
- Hosted GitHub Actions runs (for example 42080493828) failed because of an account-level runner restriction. The custom workflow was removed and publishing is branch-based.
