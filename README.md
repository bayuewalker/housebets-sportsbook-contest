# HOUSE//LIVE

A five-page, frontend-only Housebets sportsbook concept built around fast match discovery and a transparent single-bet flow.

**Owner:** bayuewalker  
**Repository:** `bayuewalker/housebets-sportsbook-contest`  
**Hosting target:** GitHub Pages  
**Status:** Implemented and locally tested. Source is published on `main`; public deployment is pending. Publishing uses a locally tested static build on `gh-pages`, with Pages set to Deploy from a branch. The final Pages setting and public URL still need verification. No contest entry has been submitted.

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

## Pages

| Page | Hash route | Main interactions |
| --- | --- | --- |
| Sports Home | `#/sports` | Featured matches, live and upcoming events, sports filters, competition discovery, search, following |
| Live | `#/live` | In-play fixtures, sport/competition filters, empty-live fallback |
| Football | `#/football` | Five required leagues, match-result odds, follow teams/competitions |
| Match Center | `#/match/ars-bha` | Scoreboard, six market categories, selectable prices, changed/suspended states |
| Betslip + My Bets | `#/bets` | Stakes, explicit odds acceptance, placement, open/settled/cash-out history |

Every sample fixture has a working Match Center. Mobile includes a persistent betslip bar and a modal bottom sheet. Favorites, settled history and demo balance persist locally. Unplaced selections and live scenario overrides reset on reload.

## Demo scenarios

Open **Demo controls** in the desktop sidebar or the sliders button beside mobile search. Available scenarios: move odds; suspend/reopen a market; fail the next valid placement; settle an open bet; remove/restore live matches; two-second loading state; reset the local demo session.

Price and suspension actions target the first selected market, or Arsenal's match-result market when the slip is empty. Each selection is an independent single bet. Totals are sums, never accumulated odds. Cash out requires a confirmation.

## Architecture

- `src/data.ts`: typed sample fixtures, markets and outcomes.
- `src/session.ts`: validates persisted demo balance, favorites and bet history.
- `src/engine.ts`: isolated state transitions, validation, decimal calculations and simulated transactions.
- `src/main.ts`: hash routing, shell, views, event delegation and accessible modal interactions.
- `src/icons.ts`: original inline SVG interface icons.
- `src/style.css`: design tokens, responsive layout and component styles.
- `tests/engine.test.ts`: behavioral tests for stake, quote, suspension, transaction, settlement and search invariants.
- `qa.html`: development-only 1440px / 390px viewport harness; not included in the production build.
- `scripts/prepare-pages.mjs`: prepares `.pages/` with the static build, `.nojekyll` and a source-commit/checksum manifest.
- `scripts/verify-pages.mjs`: verifies the public manifest and asset checksums against the current `gh-pages` commit, without credentials.

There is no server, authentication, account connection, betting API or real-money transaction. Google Fonts is the only external presentation dependency; system font fallbacks remain available.

## GitHub Pages setup

The owner selected **Deploy from a branch**. There is no custom Actions workflow in this repository.

1. Set repository **Settings → Pages → Source → Deploy from a branch**.
2. Select **gh-pages** and **/ (root)**, then Save.
3. Run `pnpm pages:verify` after deployment finishes. It checks the public manifest and served asset checksums against the publishing branch without authentication. A missing page, stale release or mismatched asset exits with failure. GitHub API rate limits and network failures are reported explicitly.
4. Complete browser interaction QA on all five routes; asset verification alone does not establish UI correctness.

`main` contains source and documentation; `gh-pages` contains only the compiled static site. `.nojekyll` skips Jekyll processing. Relative assets and hash routing support the repository subpath.

### Publish an update

From a clean checkout of the intended `main` commit, run `pnpm install --frozen-lockfile` then `pnpm pages:prepare`. This runs lint, all tests, typecheck/build, and produces `.pages/` with `build-info.json` tying the output to the exact source commit and file checksums. Copy all contents of `.pages/` to the root of `gh-pages`, removing obsolete generated assets, then commit and push without force. Do not copy source files or node_modules to the publishing branch. Verify the deployed manifest against the intended source commit.

GitHub still performs an internal Pages deployment for branch publishing. This setting does not guarantee that an account-level service restriction is resolved. See [GitHub's publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Contest and brand provenance

The implementation follows the owner's complete brief and three supplied official contest screenshots. Direct access to the contest page did not yield the starter archive, and the sportsbook was region-restricted. No geographical restriction was bypassed.

The supplied screenshots establish the navy/aqua direction and top-bar / left-navigation / side-panel structure. The official starter shell and brand pack have **not** been inspected. The current wordmark, wave motif and team monogram shields are placeholders, not official brand assets. Replace and recheck them before declaring final brand compliance.

Statistics widgets, match trackers, promotions, boosts, free bets, multis, bet builders, outrights, specials and AI search are intentionally absent.

See `JUDGE_GUIDE.md` for a short review walkthrough and `DESIGN_SYSTEM.md`, `TEST_REPORT.md`, `PROJECT_STATE.md` and `SUBMISSION.md` for the remaining handoff material. AI assistance is explicitly disclosed in the submission draft.
