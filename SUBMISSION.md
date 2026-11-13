# Housebets Sports — Submission Pack (draft)

**Status: draft for owner review.** Nothing has been submitted. The owner must review the entry and personally tick the contest confirmations, including the intellectual-property transfer for winning entries.

Contest: [Housebets Sportsbook Design Contest](https://www.housebets.com/contests/sportsbook-design) · Deadline: **14 November 2026, 18:00 UTC** (15 November 2026, 01:00 WIB).

## 1. Public prototype URL

https://bayuewalker.github.io/housebets-sportsbook-contest/

Served from `gh-pages` / (root) with no login. The live site is gh-pages `4e8b72a` (source `549dca1`, [PR #13](https://github.com/bayuewalker/housebets-sportsbook-contest/pull/13)). Submission status is separate: nothing has been submitted.

## 2. Five linked pages

| Page | Route |
| --- | --- |
| Home | `#/sports` |
| Live | `#/live` |
| Soccer | `#/football` |
| Match | `#/match/ars-bha` (every one of the 42 sample fixtures has a match page) |
| Bet slip & My bets | `#/bets` (one shared page; the same slip and history live in the desktop side panel and the phone bottom sheet) |

## 3. Big idea (787 characters)

Housebets Sports feels like the Housebets you already know: the same top bar with Weekly Prize and VIP crown, the slim icon rail, and one side panel where Bet slip, My bets and Chat sit together, so you never leave the lobby to bet. Lists are dense and calm: every live event with score and clock, and five football leagues with match-result odds on each row. Arsenal v Brighton opens on a live scoreboard and 100 markets across Popular, Goals, Halves, Handicaps, Goalscorers, Corners & cards, Players and Minutes, all searchable and collapsible. Prices flash as they move and suspended lines lock in place. The slip stays honest: singles only, stakes in USDT, an empty stake until you choose, changed odds wait for your OK, and every bet ends in a receipt you can find again in My bets.

## 4. Tools, models and assets (entry note)

Full detail with versions and licences is in `TOOLS.md`.

- **Libraries shipped:** Figtree and Red Hat Display variable fonts via Fontsource (`@fontsource-variable/figtree`, `@fontsource-variable/red-hat-display` 5.3.0, SIL OFL 1.1), self-hosted. No UI framework, template or UI kit.
- **Build and QA tools (not shipped):** TypeScript, Vite, ESLint with typescript-eslint, tsx with the Node.js test runner, Node.js, pnpm, Playwright Core driving headless Google Chrome.
- **AI agents and models:** OpenAI ChatGPT/Codex for the initial build; a Cursor Cloud Agent running Anthropic Claude (Claude Opus) for the finishing passes and this redesign (data, UI, accessibility, QA and docs); Grok Bot for contest audit, review and QA prompts. The owner directed and reviewed the work. No AI-generated images.
- **Assets:** the Housebets brand pack in `brand/` — official wordmark `brand/logo.svg` and mark `brand/mark.svg` (also `public/favicon.svg`). The top bar, left rail and side panel use that logo, the pack cyan and 8px radii. Interface icons, team badges and flags are original inline SVG/CSS. No club or league artwork. Fictional player names; all fixtures, prices and bets are sample data.
- **Hosting:** GitHub Pages, deploy from branch (`gh-pages` / root). No custom Actions deployment.

## 5. Screenshots

Captured by `QA_SCREENSHOTS=docs/screenshots pnpm qa:browser` with headless Chrome at exactly 1440×1000 (desktop) and 390×844 (phone, touch emulation, 2× density). Files are in `docs/screenshots/`.

| View | Desktop 1440 | Phone 390 |
| --- | --- | --- |
| Home | `desktop-home.jpg` | `mobile-home.jpg` |
| Live | `desktop-live.jpg` | `mobile-live.jpg` |
| Live, competition filter | `desktop-live-competition.jpg` | `mobile-live-competition.jpg` |
| Soccer | `desktop-football.jpg` | `mobile-football.jpg` |
| Match | `desktop-match.jpg` | `mobile-match.jpg` |
| Slip: empty stake, ready | `desktop-slip-empty-stake.jpg`, `desktop-slip-ready.jpg` | same names with `mobile-` |
| Slip: odds changed, suspended, failed, placed | `desktop-slip-changed.jpg`, `desktop-slip-suspended.jpg`, `desktop-slip-error.jpg`, `desktop-slip-placed.jpg` | same names with `mobile-` |
| Selected odds inside a suspended market | `desktop-suspended-selected.jpg` | `mobile-suspended-selected.jpg` |
| My bets: settled with cash-out history, after cash out | `desktop-bets-settled.jpg`, `desktop-bets.jpg` | same names with `mobile-` |

## 6. QA summary

- 37 unit tests, TypeScript, ESLint and the production build pass.
- `pnpm qa:browser`: 192/192. That total includes the 1440×1000 and 390×844 pass plus league-header checks at 320, 360 and 375, match-result clearance at 390×844, 390×740 and with the market search focused, away-player search, the no-live fallback, rail names, horizontal fades and a cash-out action on the open row.
- `pnpm qa:stress`: 52/52 checks (all 42 match pages and every market tab at both widths, taps during live price ticks, double placement, history navigation, resizing, reload and corrupt-storage recovery, and nine extra viewports from 320px to 1920px).
- Details and limits: `TEST_REPORT.md`. Requirement-by-requirement status: `REQUIREMENTS_AUDIT.md`.

## 7. Known limitations

- Sample data only. The live clock and price feed are simulated in the browser.
- Not tested on physical iOS/Android devices, Safari or Firefox, or with a full screen-reader audit.

## Contest rules (from the contest page)

- Free to enter; no deposit or wagering required.
- At most 3 submissions in any rolling 24 hours.
- Original work. Public libraries, models and tools are fine if named in the note (section 4).
- Housebets may share entries publicly under the entrant's alias.
- Prizes are paid in USDT with no wagering requirement. Results are expected about 7 days after closing.
- Winners transfer the code and design rights to Housebets; non-winners keep their work.
- One account per person. Not open to players in the United States, France or the Netherlands.

## Owner confirmations — do not tick on the owner's behalf

- Singles only; no multis, accumulators, bet builder, boosts, free bets, promos, outrights or specials.
- Sample data only; no real accounts or real money; no real player data.
- Original work, with tools and AI assistance named.
- Housebets may share the entry publicly.
- If the entry wins, the prize is full payment and Housebets receives the code, designs and rights.

The owner has not yet authorised submission.
