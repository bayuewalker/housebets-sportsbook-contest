# HOUSE//LIVE — Requirements Audit

Audit date: 12 November 2026. Owner: bayuewalker. Auditor: final contest pass on branch `cursor/final-winning-polish-a1e1`.

## Verdict

**SUBMISSION READY, pending owner approval.** Every required page, feature and state is implemented and verified in a real browser at exactly 1440px and 390px (176 automated checks), plus 29 behavioural tests. Brand alignment is an original interpretation because no official starter pack was located; this is disclosed and is not a blocker. No score is claimed.

## Sources

- The official contest screenshots supplied by the owner and the public [contest page](https://www.housebets.com/contests/sportsbook-design). The page confirms the scorecard, the 390px / 1440px requirement, a bottom-bar betslip on phones, and the tie-breakers (Match page first, then "Feels like Housebets").
- The contest rules as verified by the owner (see `SUBMISSION.md`).
- The page mentions starter files but links no downloadable ZIP. Its absence is documented, not treated as a blocker.

Evidence levels: **Verified** means source plus an automated browser or unit check. **Implemented** means source-reviewed only.

## Scorecard coverage

| Category (points) | What the entry offers | Evidence |
| --- | --- | --- |
| Home (15) | Main-event hero with live score, clock, period and result odds; Live now; Starting soon; Top competitions grid; sport filters with counts; search across teams, players, competitions and markets, with a reason chip per result; following | `desktop/mobile-sports-home.jpg`, `*-search-empty.jpg`; QA filter counts 6/1/1/1/9, four search dimensions, follow/unfollow |
| Live (10) | Every in-play fixture with ticking clocks and scores; sport and competition filters with live counts; "N in play" total; Starting soon fallback | `*-live.jpg`, `*-state-no-live.jpg`; QA: 4 live, clocks advance, Football 2, LaLiga 1 |
| Football (10) | Tabs for Premier League, Champions League, LaLiga, Serie A and Bundesliga; match-result odds on every row; follow prompt | `*-football.jpg`; QA: 2/1/1/1/1 rows, 3 odds each |
| Match (20) | Scoreboard, period and clock; six sticky categories (Popular, Goals, Halves, Handicaps, Goalscorers, Corners & Cards); live price movement with up/down markers; suspended market state; follow both teams; Football remains active in the shell for orientation | `*-match-center.jpg`, `*-state-odds-changed.jpg`, `*-state-suspended.jpg`; QA: categories, sticky visibility, active navigation, locked market, feed moves within 7.6s |
| Betslip + My Bets (20) | One combined page plus desktop rail and phone bottom bar/sheet; tap to add/remove; singles only; USDT stakes and quick stakes; changed price marked "new" with return-after-acceptance preview; suspended banner with "Remove"; failure with retry; receipt per bet; distinct Open/Settled/Cash Out offer views with confirmed cash out | `*-betslip-*.jpg`, `*-state-*.jpg`, `*-cash-out-confirm.jpg`, `*-my-bets-settled.jpg`; QA and unit tests listed below |
| Feels like Housebets (15) | Navy/aqua palette; H + wave mark; Casino/Sports switch, wallet, Deposit and profile in the top bar; left nav and right betslip on desktop; Menu/Sports/Casino/Chat/Search on phones | Original assets; official pack not located (disclosed) |
| Every state (10) | Loading skeleton, empty search, no live, odds changed, suspended, failed, placing, placed, cash-out confirm, settled, empty slip, invalid stake | `*-state-*.jpg`; QA checks each |

## Requirement matrix

| Requirement | Status | Evidence / limit |
| --- | --- | --- |
| Five pages, interconnected | Verified | Hash routes `#/sports`, `#/live`, `#/football`, `#/match/:id`, `#/bets`; QA visits each by link at both widths |
| Sports Home: Live now, Starting soon, Top competitions | Verified | Sections render with counts; competition tiles open Football filtered |
| Sports navigation | Verified | Football, Tennis, Basketball, Esports and All sports filters (6/1/1/1/9) |
| Search teams, players, competitions, markets | Verified | Unit test for match reasons; QA for Bukayo, Brighton, LaLiga, corners, no results, clear button and Escape |
| Follow teams and competitions | Verified | QA follows LaLiga, Following shows 3 rows, unfollow returns to 2; persisted |
| Live: every in-play match, filters, score and clock | Verified | 4 live fixtures, ticking clocks, sport/competition filters |
| Live: nothing live → Starting soon | Verified | No-live scenario at both widths |
| Football: five leagues, result odds on every row | Verified | League tab row counts and three odds per row |
| Match: score, clock, six categories | Verified | Arsenal v Brighton 2–1, clock advances, categories clicked |
| Match: odds movement | Verified | Background price feed (on-screen prices, never a selected one) plus Move odds scenario |
| Match: suspended markets | Verified | Pre-suspended cards market; suspend/reopen scenario |
| Betslip and My Bets on one page | Verified | `#/bets`; also desktop rail and phone sheet |
| Tap odds to add/remove; singles only | Verified | Toggle test; returns summed, never multiplied |
| Decimal odds, USDT stakes, potential return | Verified | 25 × odds computed and checked live; invalid 0.5 blocked with message |
| Changed odds need acceptance | Verified | Unit test plus QA: current price marked "new", revised return previewed, placement blocked until Accept |
| Suspended selection handling | Verified | Pick and stake kept; placement blocked; Remove suspended; reopen |
| Failed / successful placement | Verified | Failure leaves 1,000.00; retry debits once (975.00) with one receipt row; receipt unchanged by later cash out |
| My Bets: Open, Settled, Cash Out | Verified | Separate cash-out offer view; won and lost examples; Arrow-key tabs; cash out 23.00 → 998.00; settlement → 1,045.50; refresh keeps both |
| Persistent phone betslip bar | Verified | QA: bar sits above the bottom navigation without overlap at 390px; sheet opens and places bets |
| Top bar, left navigation, side betslip | Verified | Desktop 1440 screenshots |
| Wallet, navigation and profile (simulated) | Verified | Wallet and profile panels open; Deposit is non-transactional |
| Out-of-scope destinations non-transactional | Verified | Casino and Chat open explanatory panels only |
| Desktop 1440 and phone 390 | Verified | No horizontal overflow, no readable text under 11px, no targets under 24px |
| Keyboard and focus | Verified | Dialog focus, Escape returns focus to opener, focus kept on toggled odds, stake input and search; Escape clears search |
| Frontend only, sample data | Verified | No backend, accounts, payments or betting API |
| Excluded features absent | Verified | No multis/accas, bet builders, boosts, free bets, promotions, outrights, specials, stats widgets, trackers, AI search, real betting or payments |
| Big Idea 80–800 characters | Verified | 552 characters |
| Tools and AI disclosure | Verified | `SUBMISSION.md` section 4 |
| Official starter shell / brand pack | Not available | Not located; original interpretation disclosed |
| Physical devices, Safari/Firefox, screen reader | Not tested | Listed as a limitation |
| Owner approval and submission | Pending | Not submitted; IP transfer not accepted on the owner's behalf |

## Checks run for this audit

- `pnpm install --frozen-lockfile`: pass.
- `pnpm typecheck`, `pnpm lint`, `pnpm build`: pass.
- `pnpm test`: 29 passed, 0 failed (25 engine, 4 session).
- `pnpm qa:browser`: 176/176 checks passed (local build, headless Chrome, 1440×1000 and 390×844).

Public release `b26c52f` → `gh-pages` `38b9a59`: `pnpm pages:verify` passed, and `pnpm qa:browser` passed 176/176 against the live URL.

## Findings fixed in this pass

1. Many labels were 5–9px, and phone inputs were under 16px (iOS zooms on focus). Readable text now has an 11px floor and phone inputs are 16px.
2. The text glyph `≋` stood in for a logo. Replaced with an original SVG H + wave mark and favicon.
3. There was no Casino/Sports switch, profile, phone bottom navigation or `viewport-fit=cover`, so safe-area insets had no effect. All added.
4. The page title showed a focus box after every route change. Fixed.
5. Typing into search on Match Center or My Bets lost focus. Fixed.
6. Odds moved only from demo controls, and only one clock ticked. Added a simulated feed for on-screen prices and clocks for every live football match.
7. There was no per-bet receipt, explicit retry, slip-level changed/suspended banner, clear-search button or match reason. All added.
8. Several text links were under 24px tall. They now have 32px hit areas.
9. "matchs" pluralisation and a duplicated "Bet not placed" message. Fixed.
