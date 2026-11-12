# HOUSE//LIVE

A five-page, frontend-only Housebets sportsbook concept built around fast match discovery and a transparent single-bet flow.

**Owner:** bayuewalker  
**Repository:** `bayuewalker/housebets-sportsbook-contest`  
**Hosting target:** GitHub Pages  
**Status:** SUBMISSION READY, awaiting owner approval. All five pages pass automated browser QA at exactly 1440px and 390px. No entry has been submitted.

**Public prototype:** https://bayuewalker.github.io/housebets-sportsbook-contest/

## Run

Use Node.js 24 and pnpm 11.25.0.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm dev
```

`pnpm dev` serves the compiled `dist/` folder on port 4173. Rebuild after source changes. `pnpm watch` starts Vite with live reload for normal development.

`pnpm qa:browser` tests the existing `dist/` build, so run `pnpm build` first. It serves `dist/`, drives a local Chrome (Playwright Core) through every page and state at 1440×1000 and 390×844, and exits non-zero on any failed check. Set `QA_SCREENSHOTS=docs/screenshots` to refresh the screenshots, `QA_URL=<site>` to test a deployed site, and `CHROME_PATH` if Chrome is not in a standard location.

`pnpm qa:stress` uses the same setup for robustness at both widths. It opens every category on all nine Match Centers and tests rapid taps, double-clicking Place, typing a stake during live price ticks, back/forward navigation, resizing, corrupt saved data, console errors and failed requests.

## Pages

| Page | Hash route | Main interactions |
| --- | --- | --- |
| Sports Home | `#/sports` | Main-event hero, Live now, Starting soon, top competitions, sport filters, search with match reasons, following |
| Live | `#/live` | Every in-play fixture with ticking clocks, sport/competition filters with live counts, Starting soon fallback |
| Football | `#/football` | Five required league tabs, match-result odds on every row, follow teams/competitions |
| Match Center | `#/match/ars-bha` | Scoreboard and period, six sticky market categories, live price movement, changed/suspended states |
| Betslip + My Bets | `#/bets` | Stakes, quick stakes, explicit odds/return acceptance, placement receipt, retry, distinct open/settled/cash-out views |

The shell has a Housebets-style top bar (brand mark, Casino/Sports switch, simulated wallet, Deposit and profile), a left navigation and a right betslip rail on desktop. On phones, a bottom navigation (Menu, Sports, Casino, Chat, Search) sits under a persistent betslip bar that opens a bottom sheet. Casino, Chat, Deposit and profile open explanatory panels only; nothing outside the sportsbook is transactional.

Every sample fixture has a working Match Center. Favorites, settled history and demo balance persist locally. Unplaced selections and live scenario overrides reset on reload.

## Demo scenarios

Open **Demo controls** in the desktop sidebar, the sliders button beside mobile search, or the phone menu. Scenarios: move odds; suspend/reopen a market; fail the next valid placement; settle an open bet; remove/restore live matches; pause/resume the live price feed; two-second loading state; reset the local demo session.

The live price feed moves one on-screen, unselected live price every few seconds with an up/down marker. It never changes a price already in the slip; use **Move odds** to test acceptance. Price and suspension scenarios target the first selected market, or Arsenal's match-result market when the slip is empty. Each selection is an independent single bet. Totals are sums, never accumulated odds. Cash out requires a confirmation.

## Architecture

- `src/data.ts`: typed sample fixtures, markets and outcomes.
- `src/session.ts`: validates persisted demo balance, favorites and bet history.
- `src/engine.ts`: isolated state transitions, validation, decimal calculations and simulated transactions.
- `src/main.ts`: hash routing, shell, views, event delegation and accessible modal interactions.
- `src/icons.ts`: original inline SVG interface icons and the H + wave brand mark.
- `src/style.css`: design tokens, responsive layout and component styles.
- `tests/engine.test.ts`: behavioral tests for stake, quote, suspension, transaction, receipt, settlement, search and live-feed invariants.
- `scripts/qa-browser.mjs`: exact-width browser QA and screenshot capture.
- `scripts/qa-stress.mjs`: stress and error sweep across every Match Center at both widths.
- `qa.html`: development-only 1440px / 390px viewport harness; not included in the production build.
- `scripts/prepare-pages.mjs`: prepares `.pages/` with the static build, `.nojekyll` and a source-commit/checksum manifest.
- `scripts/verify-pages.mjs`: verifies the public manifest and asset checksums against the current `gh-pages` commit, without credentials.

There is no server, authentication, account connection, betting API or real-money transaction. Google Fonts is the only external presentation dependency; system font fallbacks remain available.

## GitHub Pages setup

The owner selected **Deploy from a branch**. There is no custom Actions workflow in this repository.

1. Set repository **Settings → Pages → Source → Deploy from a branch**.
2. Select **gh-pages** and **/ (root)**, then Save.
3. Run `pnpm pages:verify` after deployment finishes. It checks the public manifest and served asset checksums against the publishing branch without authentication. A missing page, stale release or mismatched asset exits with failure. GitHub API rate limits and network failures are reported explicitly.
4. Run `QA_URL=https://bayuewalker.github.io/housebets-sportsbook-contest/ pnpm qa:browser` and `pnpm qa:stress` with the same `QA_URL`; asset verification alone does not establish UI correctness.

`main` contains source and documentation; `gh-pages` contains only the compiled static site. `.nojekyll` skips Jekyll processing. Relative assets and hash routing support the repository subpath.

### Publish an update

From a clean checkout of the intended `main` commit, run `pnpm install --frozen-lockfile` then `pnpm pages:prepare`. This runs lint, all tests, typecheck/build, and produces `.pages/` with `build-info.json` tying the output to the exact source commit and file checksums. Copy all contents of `.pages/` to the root of `gh-pages`, removing obsolete generated assets, then commit and push without force. Do not copy source files or node_modules to the publishing branch. Verify the deployed manifest against the intended source commit.

GitHub still performs an internal Pages deployment for branch publishing. This setting does not guarantee that an account-level service restriction is resolved. See [GitHub's publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Contest and brand provenance

The implementation follows the owner's brief, the official contest screenshots and the public contest page. The contest page mentions starter files, but no starter ZIP or brand pack was located, so none was used. The Housebets sportsbook is region-restricted; no restriction was bypassed.

The navy/aqua palette and top-bar / left-navigation / betslip structure follow the public Housebets look. The H + wave mark, wordmark styling, club shields and league tiles are original SVG/CSS drawn for this entry; they are not official Housebets, club or league assets.

Statistics widgets, match trackers, promotions, boosts, free bets, multis, bet builders, outrights, specials and AI search are intentionally absent.

See `JUDGE_GUIDE.md` for a short review walkthrough and `DESIGN_SYSTEM.md`, `TEST_REPORT.md`, `PROJECT_STATE.md` and `SUBMISSION.md` for the remaining handoff material. AI assistance is explicitly disclosed in the submission draft.
