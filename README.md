# Housebets Sports

A five-page, frontend-only sportsbook design for the [Housebets Sportsbook Design Contest](https://www.housebets.com/contests/sportsbook-design): dense live and pre-match lists, a deep match page, and one shared Bet slip & My bets panel. All data and transactions are simulated in the browser.

**Owner:** bayuewalker  
**Repository:** `bayuewalker/housebets-sportsbook-contest`  
**Hosting target:** GitHub Pages (`gh-pages` / root)  
**Public prototype:** https://bayuewalker.github.io/housebets-sportsbook-contest/  
**Status:** draft for owner review. No entry has been submitted.

## Run

Use Node.js 22+ and pnpm 11.25.0.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm dev
```

`pnpm dev` serves the compiled `dist/` folder on port 4173; rebuild after source changes. `pnpm watch` starts Vite with live reload.

`pnpm qa:browser` tests the existing `dist/` build, so run `pnpm build` first. It serves `dist/`, drives a local Chrome through every page and slip state at 1440×1000 and 390×844, and exits non-zero on any failed check. Set `QA_SCREENSHOTS=docs/screenshots` to refresh the screenshots, `QA_URL=<site>` to test a deployed site, and `CHROME_PATH` if Chrome is not in a standard location.

`pnpm qa:stress` opens all 42 match pages and every market tab at both widths, taps prices while the live feed moves them, double-clicks Place, types stakes during live ticks, navigates back and forward, resizes through every breakpoint, reloads, corrupts saved data, and then loads all five pages at nine more viewports from 320px to 1920px (including phone landscape).

## Pages

| Page | Route | What it does |
| --- | --- | --- |
| Home | `#/sports` | Sport tabs under search, Favourites chips, Your matches (favourite team, then favourite competitions, live before upcoming), Featured carousel, Live now, Starting soon, Top competitions; search across teams, players, competitions, markets and outcome names |
| Live | `#/live` | 13 in-play events across six sports, grouped by sport and league with flags, HT status, inline suspended rows, and sport and competition filters |
| Soccer | `#/football` | Five leagues (3–10 matches each), league chips, a market dropdown (Match result, Over/Under, Both teams to score) and a Today & live / All toggle. The header count and the Today & live chip count the same fixtures |
| Match | `#/match/ars-bha` | Back button and breadcrumb, scoreboard, 100 markets on Arsenal v Brighton (every pre-match football fixture has at least 60; every live one at least 40) across Popular, Goals, Halves, Handicaps, Goalscorers, Corners & cards, Players and Minutes, market search, collapsible cards, goalscorer table, suspended markets, live price movement and a compact sticky score bar on phones |
| Bet slip & My bets | `#/bets` | The slip beside a My bets table (Placed / Bet / Odds / Stake / Returns / Result) with Open/Settled tabs, date and sport filters, expandable rows and cash-out history |

**Shell:** a top bar with the official Housebets wordmark, Weekly Prize countdown (a compact trophy and amount on phones), wallet (USDT), VIP crown and profile; a slim left icon rail; and a right side panel with **Bet slip | My bets | Chat** on desktop. Below 1100px the panel becomes a bottom slip bar and sheet; below 768px a bottom navigation replaces the rail. Casino, Weekly Prize, VIP, profile and Chat are informational previews; nothing outside the sportsbook transacts.

Favourites, bet history and the demo balance persist in `localStorage`. Unplaced picks and demo scenarios reset on reload. Times are shown in the viewer's own time zone.

## Demo controls

Open **Demo controls** from the bottom of the desktop rail or from the phone Menu. Scenarios: move odds, suspend/reopen a market, fail the next placement, settle an open bet, no live events, loading state, pause/resume live prices, and reset the demo session. Price and suspension scenarios target the first selection, or Arsenal's match result when the slip is empty.

The live feed moves one on-screen, unselected in-play price every few seconds with a green or red arrow. It never changes a price already in the slip; use **Move odds** to test acceptance. Each pick is an independent single bet; totals are sums, never multiplied odds.

## Architecture

- `src/data.ts`: 42 sample fixtures across six sports with fictional squads, kick-offs relative to the current hour.
- `src/markets.ts`: Poisson-based football market generator (result, goals, halves, handicaps, goalscorers, corners and cards, player props and minute windows) and two-way markets for other sports.
- `src/engine.ts`: state transitions, validation, decimal calculations and simulated transactions.
- `src/session.ts`: validates the persisted balance, favourites and bet history.
- `src/icons.ts`: original inline SVG icons, plus the official wordmark and mark from `brand/`.
- `src/ui/state.ts`, `format.ts`, `render.ts`, `events.ts`, `feed.ts`: UI state, formatting, rendering with focus restore, delegated events and the simulated live feed.
- `src/ui/components/`: shell, fixtures, slip, My bets, side panel, dialogs and shared pieces.
- `src/ui/pages/`: Home, Live, Soccer, Match and Bet slip & My bets.
- `src/style.css`: tokens, responsive layout and component styles.
- `tests/`: unit tests for the engine, market depth, data density and session restore.
- `scripts/qa-browser.mjs`, `scripts/qa-stress.mjs`: browser QA and screenshot capture.
- `scripts/prepare-pages.mjs`, `scripts/verify-pages.mjs`: release preparation and public-site verification.
- `qa.html`: development-only 1440px / 390px viewport harness, not part of the build.

There is no server, authentication, betting API or real-money transaction. The fonts are bundled, so the app makes no third-party requests.

## GitHub Pages

Publishing is **Deploy from a branch**: `gh-pages` / (root). There is no custom Actions workflow and no token or secret in the repository. `main` contains source and documentation; `gh-pages` contains only the compiled site.

To publish an update, from a clean checkout of the intended `main` commit run `pnpm install --frozen-lockfile` then `pnpm pages:prepare` (lint, tests, build, and `.pages/` with a `build-info.json` tying the output to the source commit). Copy the contents of `.pages/` to the root of `gh-pages`, removing obsolete assets, commit and push without force. Then run `pnpm pages:verify` and the two QA scripts with `QA_URL=https://bayuewalker.github.io/housebets-sportsbook-contest/`.

## Provenance

The shell uses the Housebets brand pack in `brand/` (official wordmark and mark, cyan, 8px radii) and follows the contest wireframes. Interface icons, badges and flags are original. Player names are fictional and all data is sample data. Multis, accumulators, bet builder, boosts, free bets, promos, outrights, specials, stats widgets, match trackers and AI search are intentionally absent.

Tools, libraries and AI models are listed in `TOOLS.md`. See also `JUDGE_GUIDE.md`, `DESIGN_SYSTEM.md`, `TEST_REPORT.md`, `REQUIREMENTS_AUDIT.md`, `PROJECT_STATE.md` and `SUBMISSION.md`.
