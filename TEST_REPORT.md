# HOUSE//LIVE QA Report

## Scope and environment

Frontend-only prototype. Data flow: UI action → in-memory state transition → validation/calculation → DOM feedback and local demo history. There is no backend, database, payment or betting API.

Tooling: Node.js 24, pnpm 11.25.0, TypeScript, Vite 8, ESLint, the Node test runner via tsx, and Playwright Core 1.56.1 driving the system Google Chrome in headless mode.

## 2026-11-08 finishing pass

### Automated checks

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS |
| `pnpm test` | **29 passed, 0 failed** (25 engine, 4 session) |
| `pnpm build` | PASS |
| `pnpm qa:browser` against the local build | **164/164 passed** |

New behavioural tests: a suspended changed selection is never silently accepted; repeat placement never double-debits; one receipt per single with correct returns and unique IDs; search match reasons; removing suspended picks keeps open picks and stakes; the live feed never moves a selected price (200 iterations), clears stale markers, stops when nothing is live, and can be limited to on-screen prices.

### Browser QA (`scripts/qa-browser.mjs`)

Each viewport starts from a fresh session: desktop 1440×1000, and phone 390×844 with touch and mobile emulation.

| Area | What is checked at both widths |
| --- | --- |
| Layout, all five pages | No horizontal overflow; no readable text under 11px; no interactive target under 24px; on the phone, the betslip bar does not overlap the bottom navigation |
| Sports Home | Sport filter counts 6/1/1/1/9; search by player (with reason chip), team, competition and market; empty search guidance; clear button keeps focus; Escape clears; follow, Following filter and unfollow |
| Live | 4 in-play fixtures with clocks; Football filter 2; LaLiga filter 1 |
| Football | League tabs show 2/1/1/1/1 rows, each with 3 result odds |
| Match Center | Clock advances; six categories; cards market locked; the live feed moves an on-screen price within 7.6s |
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

Source `22fc71610434c3ef4c2cb7fc435ec3dec0a7d8c4` was published as `gh-pages` `fb0c377f75b2ccc8354fa1e26d8281e5700351d4`. Before publishing, the release build passed `pnpm pages:prepare` (lint, 29 tests, build) and `pnpm qa:browser` 164/164. After publishing, `pnpm pages:verify` passed with all 4 public assets matching, and `QA_URL=https://bayuewalker.github.io/housebets-sportsbook-contest/ pnpm qa:browser` passed 164/164 against the live site at 1440px and 390px.

### Limits

- Headless Chrome with device emulation, not physical iOS/Android hardware. The real on-screen keyboard was not exercised; inputs are 16px and sheets use `dvh` to cope with it.
- Safari and Firefox not tested. No full screen-reader audit or WCAG conformance claim.

## Earlier history (5–7 November 2026)

- 5 November: iframe-based checks at 1440×1000 and 390×844 covered stake calculation, changed odds, suspension, failure/retry, cash out, league coverage, filters, search, following, no live, reset and mobile placement.
- 6 November: quality pass. Live goal lines were corrected to 3.5/4.5, session validation and keyboard history tabs were added, and the suite reached 21 tests.
- 7 November: Pages moved to deploy from `gh-pages` / root (source `694b3ad`, gh-pages `00de167`). A public desktop sweep at about 1363px passed, and Fail next placement now closes the dialog. Local Chrome was blocked by policy in that environment, so exact-width checks stayed open until this pass.
- Hosted GitHub Actions runs (for example 42080493828) failed because of an account-level runner restriction. The custom workflow was removed and publishing is branch-based.
