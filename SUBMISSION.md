# Housebets Sports — Submission Pack (draft)

**Status: draft for owner review.** Nothing has been submitted. The owner must review the entry and personally tick the contest confirmations, including the intellectual-property transfer for winning entries.

Contest: [Housebets Sportsbook Design Contest](https://www.housebets.com/contests/sportsbook-design) · Deadline: **14 November 2026, 18:00 UTC** (15 November 2026, 01:00 WIB).

## 1. Public prototype URL

https://bayuewalker.github.io/housebets-sportsbook-contest/

Served from `gh-pages` / (root) with no login. The public site shows the redesign only after the owner merges it to `main` and publishes a new `gh-pages` build (see `README.md`). Re-run `pnpm pages:verify` and the browser QA against the public URL after publishing.

## 2. Five linked pages

| Page | Route |
| --- | --- |
| Home | `#/sports` |
| Live | `#/live` |
| Soccer | `#/football` |
| Match | `#/match/ars-bha` (every one of the 42 sample fixtures has a match page) |
| Bet slip & My bets | `#/bets` (one shared page; the same slip and history live in the desktop side panel and the phone bottom sheet) |

## 3. Big idea (568 characters)

Housebets Sports keeps the Housebets look and gets out of the way. A familiar shell (slim icon rail, Weekly Prize and VIP crown up top, and one side panel for Bet slip, My bets and Chat) frames dense, readable lists: 13 live events, five football leagues and a match page with 47 markets you can search, filter and collapse. Prices flash green or red as they move and suspended lines lock in place. The slip is honest: the stake starts empty, changed odds wait for your approval, every pick is a single, and every bet ends with a receipt you can find again in My bets.

## 4. Tools, models and assets (entry note)

Full detail with versions and licences is in `TOOLS.md`.

- **Libraries shipped:** Figtree and Red Hat Display variable fonts via Fontsource (`@fontsource-variable/figtree`, `@fontsource-variable/red-hat-display` 5.3.0, SIL OFL 1.1), self-hosted. No UI framework, template or UI kit.
- **Build and QA tools (not shipped):** TypeScript, Vite, ESLint with typescript-eslint, tsx with the Node.js test runner, Node.js, pnpm, Playwright Core driving headless Google Chrome.
- **AI agents and models:** OpenAI ChatGPT/Codex for the initial build; a Cursor Cloud Agent running Anthropic Claude (Claude Opus) for the finishing passes and this redesign (data, UI, accessibility, QA and docs). The owner directed and reviewed the work. No AI-generated images.
- **Assets:** the H mark, icons, team badges and flags are original inline SVG/CSS. No official Housebets, club or league artwork. Fictional player names; all fixtures, prices and bets are sample data.
- **Brand pack:** the official starter files / brand pack were not available to the author. The shell follows the contest wireframes and the public Housebets look, and will be aligned with the official files if they are provided.
- **Hosting:** GitHub Pages, deploy from branch (`gh-pages` / root). No custom Actions deployment.

## 5. Screenshots

Captured by `QA_SCREENSHOTS=docs/screenshots pnpm qa:browser` with headless Chrome at exactly 1440×1000 (desktop) and 390×844 (phone, touch emulation, 2× density). Files are in `docs/screenshots/`.

| View | Desktop 1440 | Phone 390 |
| --- | --- | --- |
| Home | `desktop-home.jpg` | `mobile-home.jpg` |
| Live | `desktop-live.jpg` | `mobile-live.jpg` |
| Soccer | `desktop-football.jpg` | `mobile-football.jpg` |
| Match | `desktop-match.jpg` | `mobile-match.jpg` |
| Slip: empty stake, ready | `desktop-slip-empty-stake.jpg`, `desktop-slip-ready.jpg` | same names with `mobile-` |
| Slip: odds changed, suspended, failed, placed | `desktop-slip-changed.jpg`, `desktop-slip-suspended.jpg`, `desktop-slip-error.jpg`, `desktop-slip-placed.jpg` | same names with `mobile-` |
| My bets: settled with cash-out history, after cash out | `desktop-bets-settled.jpg`, `desktop-bets.jpg` | same names with `mobile-` |

## 6. QA summary

- 34 unit tests, TypeScript, ESLint and the production build pass.
- `pnpm qa:browser`: 123/123 checks at 1440px and 390px (all five pages, data density, market depth, search, collapse, sticky phone score bar, live price arrows, every slip state, the My bets table and filters, cash out, tap-target size, focus and console errors).
- `pnpm qa:stress`: 52/52 checks (all 42 match pages and every market tab at both widths, taps during live price ticks, double placement, history navigation, resizing, reload and corrupt-storage recovery, and nine extra viewports from 320px to 1920px).
- Details and limits: `TEST_REPORT.md`. Requirement-by-requirement status: `REQUIREMENTS_AUDIT.md`.

## 7. Known limitations

- The official brand pack was not available, so brand alignment is an interpretation, not a pixel match to official assets.
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
