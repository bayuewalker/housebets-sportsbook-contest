# HOUSE//LIVE Design System

## Product idea

The sports command center: a familiar Housebets shell, a match-focused content area and an always-reachable betslip. The interaction order is event → market → price → stake → reviewed confirmation → receipt.

## Brand

- **Mark:** an original rounded-square H whose two uprights are joined by a wave (`brandMark()` in `src/icons.ts`, also `public/favicon.svg`). The wordmark is "Housebets" in Manrope 800 with an aqua H.
- **Provenance:** drawn for this entry to evoke the public Housebets navy/aqua identity. No official logo file, starter pack or brand pack was available, so none is used. Club shields and league tiles are generic two-tone CSS shapes with text monograms; no real crests or league logos.
- **Shell:** a top bar with the mark, Casino/Sports switch, demo badge, wallet balance in USDT, Deposit and profile; a left navigation; a right betslip rail. On phones, Menu / Sports / Casino / Chat / Search sit in a bottom navigation below the persistent betslip bar. Casino, Chat, Deposit and profile are informational, never transactional.

## Tokens (`src/style.css :root`)

| Role | Token | Value |
| --- | --- | --- |
| Page background | `--bg` | `#050c11` |
| Shell (top bar, sidebar) | `--shell` | `#08131a` |
| Surfaces | `--surface`, `--surface-2` | `#0b1920`, `#0f2029` |
| Raised controls | `--raised`, `--raised-2` | `#132833`, `#1a3441` |
| Primary / secondary / muted text | `--text`, `--text-2`, `--muted` | `#eef5f7`, `#b4c6ce`, `#8aa0aa` |
| Brand aqua (selected odds, primary action) | `--cyan`, `--cyan-2`, `--cyan-ink` | `#16e6f2`, `#6cf2f8`, `#022429` |
| Live | `--live` | `#ff4d67` |
| Changed odds / suspended warning | `--amber` | `#f6c35c` |
| Price up / down | `--up`, `--down` | `#34d399`, `#fb7185` |
| Danger / success | `--danger`, `--success` | `#ff8f9c`, `#3fe0a2` |

Typography: Manrope for display (headings, scores, team names), DM Sans for interface text, both with system fallbacks. Prices, balances and clocks use tabular numerals. **Readable text is 11px or larger**; the only smaller glyphs are decorative, `aria-hidden` league monograms (10px) that always sit beside the full league name, and the up/down arrow beside a price. Phone inputs (search, select, stake) are 16px so iOS does not zoom.

## Layout

| Width | Sidebar | Betslip | Notes |
| --- | --- | --- | --- |
| ≥1600px | 240px | 360px rail | |
| 1281–1599px (1440 target) | 224px | 340px rail | |
| 1051–1280px | 200px | 304px rail | Bets page goes to one column |
| 761–1050px | 200px | Fixed bottom bar + sheet | |
| ≤760px (390 target) | Drawer | Bar above bottom nav + sheet | 58px header; bottom nav `62px + safe-area inset`; 70px slip bar |
| ≤359px | Drawer | Bar + sheet | Wordmark hidden, mark only |

`viewport-fit=cover` enables `env(safe-area-inset-*)`. Sheets are sized with `dvh` so they fit above an on-screen keyboard. Content gets bottom padding equal to the slip bar plus bottom nav, so nothing is hidden behind them.

## Components and states

| Component | Normal | Selected / changed | Unavailable |
| --- | --- | --- | --- |
| Odds button | Navy tile, outcome name and decimal price | Solid aqua with a check; green/red border, arrow and brief flash when the price moves | Dashed border, lock icon, disabled |
| Market group | Title, outcome count, odds grid | — | "Suspended" chip and explanation; picks kept |
| Selection card | Live/single tag, outcome, market, fixture link, stake with quick stakes, return | Current price marked "new"; old → new warning; revised return preview | Suspended note; placement paused |
| Slip summary | Total stake, potential return (sum of singles), "Place single bet · X USDT" | Amber banner, return-after-acceptance total and "Accept new odds" | Suspended banner with "Remove"; disabled place button with reason |
| Placement | Busy state blocks repeat clicks | Success notice with one receipt row per single and a My Bets link | "Bet not placed" with reason and "Try again"; no debit |
| Bet card | Status, fixture, outcome, odds, stake, return, reference | Separate Cash Out offer view and confirmation | Settled won/lost/cashed |
| Fixture row | Status/time, teams with shields, score, star, result odds, more-markets link | Search reason chip ("Player · Bukayo Saka") | — |
| Loading / empty | Skeleton rows; empty search with clear; Starting soon when nothing is live | | |

Motion: odds flash, live dot pulse and sheet transitions are all disabled under `prefers-reduced-motion`.

## Accessibility

- Native buttons, links, inputs, selects and `<dialog>` elements; a skip link; visible focus rings.
- `aria-pressed` on odds, filters and quick stakes. `aria-invalid` and `aria-describedby` on stake errors. Status and alert regions for receipts and failures. Text always accompanies colour.
- Focus survives re-renders: the focused control is restored, dialogs move focus inside, and Escape or close returns it to the opener. Route changes focus the page title without a visible box.
- My Bets tabs use Arrow/Home/End. `/` focuses search; Escape clears it.
- Interactive targets are at least 24px (most 40px+), and text links have 32px hit areas.
- Not claimed: a full screen-reader audit or WCAG conformance.
