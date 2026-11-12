# Housebets Sports — Design System

## Product idea

A familiar Housebets shell around dense, readable sports lists and an honest single-bet flow. The interaction order is event → market → price → stake → reviewed confirmation → receipt, and the slip and bet history always share one panel.

## Brand

- **Mark and wordmark:** an original rounded-square H mark (`brandMark()` in `src/icons.ts`, also `public/favicon.svg`) beside "Housebets" set in Red Hat Display. The mark is a placeholder drawn for this entry and should be swapped for the official logo once the brand pack is provided.
- **Fonts:** Figtree (interface text) and Red Hat Display (headings, scores, prices in the scoreboard, wordmark), both variable fonts bundled from Fontsource under the SIL Open Font License.
- **Shell:** top bar with rail toggle, mark, Weekly Prize countdown, wallet pill in USDT, Wallet button, VIP crown, profile and panel toggle; a 72px icon rail (Casino/Sports switch, Home, Live, Soccer, other sports, Favourites, My bets, Demo controls) with tooltips; a right side panel with **Bet slip | My bets | Chat**. On phones, a bottom navigation (Menu, Sports, Casino, Chat, Search) sits under a persistent slip bar.
- **Provenance:** the layout follows the contest wireframes and the public Housebets look. No official Housebets, club or league artwork is used. Team badges are colour blocks with three-letter codes; flags are simple original SVGs.

## Tokens (`src/style.css :root`)

| Role | Token | Value |
| --- | --- | --- |
| Page background | `--bg` | `#08151b` |
| Shell (top bar, rail, panel) | `--shell` | `#0b1a21` |
| Cards | `--card`, `--card-2`, `--raised` | `#0e1e25`, `#12262e`, `#162d36` |
| Lines | `--line`, `--line-2` | `#1a2e36`, `#24404a` |
| Text | `--text`, `--text-2`, `--muted` | `#eef5f6`, `#b6c7cd`, `#869ba3` |
| Brand cyan (links, active icons) | `--brand` | `#22e2e8` |
| Primary action / selected price | `--accent`, `--accent-ink` | `#a7f0f1`, `#06282c` |
| Prices | `--price` | `#5fe3ea` |
| Live | `--live` | `#ff4d67` |
| Price up / down | `--up`, `--down` | `#3ddc97`, `#ff6b81` |
| Changed odds / HT / cashed out | `--amber` | `#f6c35c` |
| Radii | `--radius`, `--r-sm` | 16px, 10px |
| Shell sizes | `--topbar`, `--rail`, `--panel`, `--nav-h`, `--bar-h` | 64px, 72px, 340px, 64px, 60px |

Prices, balances, scores and clocks use tabular numerals. Phone inputs are 16px so iOS does not zoom on focus.

## Layout

| Width | Rail | Side panel | Notes |
| --- | --- | --- | --- |
| ≥1440px | 72px icon rail | 340px | Two-column market grid on the match page |
| 1280–1439px | Rail | 320px | Narrower odds column in lists |
| 1100–1279px | Rail | 320px | Markets in one column; compact list columns so full team names fit |
| 768–1099px | Rail | Hidden; slip bar + bottom sheet | Compact sticky score bar on the match page |
| ≤899px | Rail | Bar + sheet | Weekly Prize widget hidden |
| ≤767px (390 target) | Bottom navigation | Bar + sheet | Event rows stack odds under teams; My bets table becomes cards; 44px tap targets |
| ≤380px | Bottom navigation | Bar + sheet | Wordmark hidden, mark only; tighter goalscorer table |

`viewport-fit=cover` enables safe-area insets. Content gets bottom padding equal to the slip bar plus bottom navigation, so nothing is hidden behind them.

## Components and states

| Component | Normal | Selected / moving | Unavailable |
| --- | --- | --- | --- |
| Odds button | Card tile with outcome label and cyan price; full `aria-label` (match, market, outcome, price) | Pale-cyan fill; a green ▲ or red ▼ and a short flash when the price moves | Dashed tile with a lock, disabled |
| Event row | Status or kick-off, league with flag, teams with badges and score, three prices, "+N" link to the match page | Search reason chip when searching | "Suspended" tag with locked prices; "Market settled" when the line is gone |
| Market card | Collapsible header with name, body of prices; list layout for correct score; 3×3 table for HT/FT | — | Suspended message; picks already in the slip are kept |
| Goalscorer table | Player / Next / Anytime / 2+ with a team switch | — | "–" where a price is not offered |
| Slip pick | Market, outcome, price, match link, stake field (empty, placeholder 0.00), quick stakes 5/10/25/50/100, returns | Old price struck through beside the new one, "Accept odds" | Suspended message; placing paused |
| Slip footer | Total stake, returns, Place bet · X USDT, pinned to the bottom of the sheet on phones | Accept odds above Place bet | Button label says what is missing ("Enter a stake", "Enter a stake for each pick") |
| Placement | Busy state blocks repeat clicks | Receipt with one line per single and a My bets link | "Bet not placed" with Try again; no debit |
| My bets table | Placed / Bet / Odds / Stake / Returns / Result; Open and Settled tabs; date and sport filters | Expanded row with reference, times and cash-out history; won rows highlighted | Empty state per filter |
| Loading / empty | Skeleton rows; empty search; starting-soon fallback when nothing is live | | |

Motion: price flashes, the live dot pulse and sheet transitions are disabled under `prefers-reduced-motion`.

## Accessibility

- Native buttons, links, inputs, selects and `<dialog>`; a skip link; visible focus rings.
- Every odds button has a descriptive `aria-label`. Tabs use `role="tab"` with arrow-key navigation. Collapsible cards use `aria-expanded` and `aria-controls`.
- Focus survives re-renders, dialogs move focus inside and return it on close, and route changes focus the page title.
- On phones, primary controls (odds, tabs, chips, quick stakes, navigation, top-bar buttons) are at least 44px tall.
- `/` focuses search and Escape clears it.
- Not claimed: a full screen-reader audit or WCAG conformance.
