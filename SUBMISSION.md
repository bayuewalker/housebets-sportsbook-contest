# HOUSE//LIVE — Submission Draft

**Status: not submitted; awaiting final responsive QA, official asset reconciliation and owner approval.** Public GitHub Pages deployment is verified using `gh-pages` / (root).

## 1. Public prototype URL

https://bayuewalker.github.io/housebets-sportsbook-contest/

Verified without login on 7 November 2026 (WIB). A source-commit manifest in `gh-pages` records the exact published revision and checksums; rerun `pnpm pages:verify` after each deployment, including the latest usability update.

## 2. Five pages

- Sports Home — `#/sports`
- Live — `#/live`
- Football — `#/football`
- Match Center — `#/match/ars-bha`
- Betslip + My Bets — `#/bets` (one combined page)

## 3. Big idea

HOUSE//LIVE makes Housebets the home of every sporting moment. A familiar navy-and-aqua shell brings live matches, followed teams and clear markets into one focused command center. The Match Center keeps the score and the next decision in view, while a persistent betslip makes every single bet transparent: the price you chose, the stake you set and the return you reviewed. Changed odds require your acceptance, suspended picks stay safe, and every outcome is clearly acknowledged—on desktop and phone.

## 4. Tools, templates and AI disclosure

Designed and implemented with AI assistance from OpenAI ChatGPT/Codex. Frontend: TypeScript, Vite, HTML and custom CSS. Quality checks: TypeScript, ESLint, Node test runner and browser-based manual interaction tests. Fonts: Manrope and DM Sans via Google Fonts. Interface SVG icons, club monograms and decorative backgrounds are original code-based assets. No third-party sportsbook template or UI kit was used in the application. A standard environment toolchain was used for local builds; it does not contribute application UI. Local validation and GitHub Pages branch publishing are used; there is no custom Actions deployment workflow.

The implementation used the official brief screenshots supplied by the owner. The official starter archive and brand pack were not accessible during development. The current Housebets wordmark/wave and team shields are provisional and must be reconciled before final submission.

## 5. Screenshots

- `docs/screenshots/desktop-match-1440.jpg` — Match Center, 1440px QA frame (toolbar included).
- `docs/screenshots/mobile-betslip-390.jpg` — interactive betslip, 390×844px frame.

- `docs/screenshots/public-match-desktop.jpg` — current public release, desktop browser viewport 1363×936; captured 7 November 2026 (WIB).

The earlier 1440px and 390px images predate the live-market correction. Refresh those exact-width screenshots before submitting.

## 6. QA report

See `TEST_REPORT.md` and the requirement-by-requirement sign-off in `REQUIREMENTS_AUDIT.md`. Public desktop smoke tests and release verification passed; repeat exact-width 1440px / 390px coverage before final submission.

## Owner confirmations to review before sending

- Singles only; no multis, boosts or free bets.
- Sample data only; no real player accounts or real money.
- Original work with all tools and assets disclosed.
- Housebets may share the entry publicly.
- If this entry wins, the prize is full payment and Housebets owns the winning code, designs and rights.

Do not tick or submit these acknowledgements on the owner's behalf without explicit approval. The owner has not authorized submission.
