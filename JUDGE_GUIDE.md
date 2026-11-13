# Housebets Sports — review walkthrough

https://bayuewalker.github.io/housebets-sportsbook-contest/ — no login, deposit or account needed. All data, prices and transactions are simulated in your browser, and every player name is fictional.

## A two-minute tour

1. **Home:** sport tabs sit under the search, with your Favourites as chips. Your matches lead with Arsenal, then favourite competitions, live before upcoming. A Featured carousel, Live now (View all 13) and Starting soon follow. Search for `Marlow` (a fictional player), `Over 2.5`, `Both teams to score` or `corners`; each result says why it matched, including the market name.
2. **Live:** 13 in-play events grouped by sport and league, with flags, ticking clocks, an HT match and an inline suspended row. Filter by sport, then by competition. A sport and competition with nothing in play shows an empty state.
3. **Soccer:** five leagues with 3–10 matches each. The header and the Today & live chip share one count. Switch the row market between Match result, Over/Under and Both teams to score, and toggle Today & live / All.
4. **Match:** open Arsenal v Brighton. It opens on Popular, with Match result above the phone slip bar. Use the back button or the breadcrumb Soccer › England › Premier League › ARS–BHA. All markets still holds the full list, about 100 markets across Popular, Goals, Halves, Handicaps, Goalscorers, Corners & cards, Players and Minutes. On Goalscorers, search `Rafe` while Arsenal stays selected: his Next and Anytime prices appear. Player cards name the threshold and the period, for example `1+ shots on target · rest of match`. Collapse cards and watch prices flash green or red. Corners & cards has suspended markets. On a phone, scroll down and a compact score bar sticks under the top bar. The top bar also shows a compact Weekly Prize next to the VIP crown.
5. **Demo states:** the labelled Demo states control, on the home page and in the phone match header, opens a three-step sequence: change odds, suspend, then fail a placement and retry. It is separate from placing a bet.
6. **Bet slip & My bets:** tap **Arsenal**. The stake starts empty; use a quick-stake chip or type one. Place the single and read the receipt. In My bets, filter by date and sport, expand a row for details, and open Settled to see wins highlighted and cash-out history. Cash out is on the open Arsenal row before you expand it; confirmation credits that amount once.

On phones, the bet slip bar sits above the bottom navigation on every page and opens a sheet with **Accept odds** / **Place bet** pinned to its bottom. Toasts appear above the bar, never over it.

## Judge-controlled states

Open **Demo states** from the labelled control on Home, the phone match header, the desktop rail, or the phone Menu. Price and suspension scenarios target the first selection, or Arsenal's match result when the slip is empty.

| Scenario | Expected result |
| --- | --- |
| Move odds | The pick shows the old price struck through and the new one, the slip explains the change, and placement waits for **Accept odds**. |
| Suspend / reopen | The pick and stake stay; placing is paused with an explanation. Toggle again to reopen. |
| Fail next placement | The next placement shows "Bet not placed" with **Try again**; balance and history are unchanged. Retry places once. |
| Settle an open bet | The first open bet is marked won and its return credited once. |
| No live events | Live shows the starting-soon fallback. |
| Loading state | Skeleton rows for two seconds. |
| Pause live prices | Stops background price movement. |
| Reset demo | After confirmation, the sample history and 1,000 USDT are restored. |

## Worth checking

- Several picks stay separate singles, each with its own stake and receipt line. Odds are never multiplied.
- Invalid or unaffordable stakes block placement with a reason; the Place button says what is missing.
- Casino, Weekly Prize, VIP, profile and Chat are previews only; nothing outside the sportsbook transacts.
- Keyboard: `/` focuses search; tabs use the arrow keys; dialogs close with Escape and return focus.
- Refresh keeps placed bets, favourites and balance. Unplaced picks and scenarios reset.
- Times are shown in your own time zone (stated in the footer).

Tools, libraries and AI models are named in `TOOLS.md`.
