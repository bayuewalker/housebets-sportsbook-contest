# HOUSE//LIVE — Submission Pack

**Status: SUBMISSION READY — awaiting owner approval.** Nothing has been submitted. The owner must review the entry and personally tick the contest confirmations, including the intellectual-property transfer for winning entries.

Contest: [Housebets Sportsbook Design Contest](https://www.housebets.com/contests/sportsbook-design) · Deadline: **14 November 2026, 18:00 UTC** (15 November 2026, 01:00 WIB).

## 1. Public prototype URL

https://bayuewalker.github.io/housebets-sportsbook-contest/

Served from `gh-pages` / (root) with no login. Current release: source `b26c52f547839cd6bdef6185c2241cfad768cd26`, `gh-pages` `38b9a5982fc64f5a9fb3155b0eeebb6ae89a8aa7`. `pnpm pages:verify` passed, and all 176 browser checks passed against the live URL on 12 November 2026.

## 2. Five pages

| Page | Route |
| --- | --- |
| Sports Home | `#/sports` |
| Live | `#/live` |
| Football | `#/football` |
| Match Center | `#/match/ars-bha` (every fixture has one) |
| Betslip + My Bets | `#/bets` (one combined page; the betslip is also a persistent desktop rail and a phone bottom bar) |

## 3. Big Idea (552 characters)

HOUSE//LIVE makes Housebets the home of every sporting moment. One calm navy-and-aqua shell puts live matches, followed teams and the next kickoff a tap away. The Match Center keeps the score, the clock and moving prices in view, so every decision has context. A persistent betslip makes each single bet transparent: the price you chose, the stake you set and the return you reviewed. Changed odds wait for your acceptance, suspended picks stay safe, a failed placement never costs you, and every bet ends with a clear receipt, on desktop and on phone.

## 4. Tools, templates and AI disclosure

- **AI assistance:** designed and implemented with AI coding assistants — OpenAI ChatGPT/Codex for the initial build, and a Cursor Cloud Agent (Anthropic Claude) for the finishing pass (brand shell, states, readability, browser QA and documentation). The owner directed and reviewed the work.
- **Frontend:** TypeScript, Vite, HTML and hand-written CSS. No UI framework, sportsbook template or UI kit.
- **Quality tooling (not shipped):** ESLint, the Node.js test runner via tsx, and Playwright Core driving a local Chrome for viewport QA.
- **Fonts:** Manrope and DM Sans from Google Fonts, with system fallbacks.
- **Assets:** every icon, the H + wave brand mark, club shields, league tiles and backgrounds are original inline SVG/CSS made for this entry. No photos, official crests, league logos or official Housebets files are bundled.
- **Starter pack:** the contest page mentions starter files, but no downloadable starter ZIP or brand pack was located. None was used, and the entry does not claim to use official assets. The navy/aqua palette and top bar / left navigation / right betslip structure follow the public Housebets look and the contest brief.
- **Hosting:** GitHub Pages, deploy from branch (`gh-pages` / root). No custom Actions deployment.

## 5. Screenshots

All captured by `pnpm qa:browser` with headless Chrome at exactly 1440×1000 (desktop) and 390×844 (phone, touch emulation). Files live in `docs/screenshots/`, named `desktop-*.jpg` and `mobile-*.jpg`.

| View | Desktop 1440 | Phone 390 |
| --- | --- | --- |
| Sports Home | `desktop-sports-home.jpg` | `mobile-sports-home.jpg` |
| Live | `desktop-live.jpg` | `mobile-live.jpg` |
| Football | `desktop-football.jpg` | `mobile-football.jpg` |
| Match Center | `desktop-match-center.jpg` | `mobile-match-center.jpg` |
| Betslip + My Bets | `desktop-betslip-my-bets.jpg` | `mobile-betslip-my-bets.jpg` |
| Stake entry | `desktop-betslip-stake.jpg` | `mobile-betslip-stake.jpg` |
| Odds changed / suspended / failed / placed | `desktop-state-*.jpg` | `mobile-state-*.jpg` |
| Loading, no live, empty search | `desktop-state-loading.jpg`, `desktop-state-no-live.jpg`, `desktop-search-empty.jpg` | same names with `mobile-` |
| Cash out, settled, demo controls | `desktop-cash-out-confirm.jpg`, `desktop-my-bets-settled.jpg`, `desktop-demo-controls.jpg` | same names with `mobile-`, plus `mobile-menu.jpg` |

## 6. QA summary

- 29 behavioural tests, TypeScript, ESLint and the production build pass after a frozen-lockfile install.
- 176 automated browser checks pass across 1440px and 390px: every page, filter, search, follow, sticky market categories and active navigation, odds toggle, stake validation, changed-price and revised-return review, suspended/failed/placed states, distinct Cash Out offers, won/lost history, settlement, persistence, dialogs, Escape and focus return, the live price feed, overflow, minimum text size, touch-target size, and the phone betslip bar vs bottom navigation.
- Details and limits: `TEST_REPORT.md`. Requirement-by-requirement status: `REQUIREMENTS_AUDIT.md`.

## 7. Known limitations

- Starter files and brand pack were not located, so brand alignment is an original interpretation, not a pixel match to official assets.
- Sample data only. The live clock and price feed are simulated in the browser.
- Not tested on physical iOS/Android devices, Safari or Firefox, or with a full screen-reader audit. The phone keyboard was emulated (16px inputs to avoid iOS zoom, bottom sheet sized to the dynamic viewport).
- Google Fonts needs a network request; system fonts take over offline.

## Contest rules (verified by the owner)

- Free to enter; no deposit or wagering required.
- At most 3 submissions in any rolling 24 hours.
- Work must be original. AI tools and public libraries are allowed if disclosed (section 4).
- Housebets may share entries publicly under the entrant's alias.
- Prizes are paid in USDT with no wagering requirement. Results are expected about 7 days after closing.
- Winners transfer the code and design rights to Housebets; non-winners keep their work.
- One account per person. Residents of the United States, France and the Netherlands are excluded.

## Owner confirmations — do not tick on the owner's behalf

- Singles only; no multis, bet builders, boosts, free bets or promotions.
- Sample data only; no real accounts or real money.
- Original work, with tools and AI assistance disclosed.
- Housebets may share the entry publicly.
- If the entry wins, the prize is full payment and Housebets receives the code, designs and rights.

The owner has not yet authorised submission.
