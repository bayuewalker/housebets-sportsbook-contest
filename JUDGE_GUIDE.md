# HOUSE//LIVE review walkthrough

https://bayuewalker.github.io/housebets-sportsbook-contest/ — no login, deposit or account needed. All data, prices and transactions are simulated in your browser.

## A two-minute tour

1. **Sports Home:** the main event (Arsenal v Brighton, live) leads, followed by Live now, Starting soon and Top competitions. Search for `Bukayo`, `LaLiga` or `corners`; each result says why it matched. Tap ☆ on a competition, then open **Following**.
2. **Live:** every in-play match, with ticking clocks. Filter by sport or competition; the counts show what is live.
3. **Football:** switch between Premier League, Champions League, LaLiga, Serie A and Bundesliga. Every row has match-result odds.
4. **Match Center:** open Arsenal v Brighton. Watch the prices: one on-screen price moves every few seconds with a green or red marker. Browse the six categories; Corners & Cards contains a suspended market. Tap **Arsenal** and enter 25 USDT.
5. **Betslip + My Bets:** place the single bet and read the receipt. Open My Bets, cash out with confirmation, and find it under Settled. On a phone, the betslip bar sits above the bottom navigation on every page and opens a bottom sheet.

The live feed never changes a price that is already in your slip. Use the scenario panel to test that flow.

## Judge-controlled edge states

Open **Demo controls**: in the desktop sidebar, from the sliders button beside the phone search, or from the phone Menu. Price and suspension scenarios target the first selection, or Arsenal's match result when the slip is empty.

| Scenario | Expected result |
| --- | --- |
| Move odds | The slip shows "Odds changed" and blocks placement until you press **Accept new odds**. 25 USDT at 1.60 returns 40.00 USDT. |
| Suspend / reopen | Odds lock. Your pick and stake stay, the slip explains placement is paused and offers **Remove**. Toggle again to reopen. |
| Fail next placement | The panel closes. The next placement shows "Bet not placed" with **Try again**; balance and history are unchanged. Retry succeeds once. |
| Settle an open bet | The first open bet becomes Won and its return is credited once. |
| No live matches | Live shows Starting soon; former live fixtures show kick-off times. |
| Live price feed | Pause or resume background price movement. |
| Loading state | Skeleton rows for two seconds, then fixtures return. |
| Reset demo | After confirmation, the sample history, favourites and 1,000 USDT are restored. |

## Worth checking

- Several picks remain separate singles, each with its own stake and receipt line. Odds are never multiplied.
- Invalid or unaffordable stakes block placement with a reason.
- Casino, Chat, Deposit and the profile are informational panels; nothing outside the sportsbook transacts.
- Keyboard: `/` focuses search and Escape clears it. Dialogs close with Escape and return focus. My Bets tabs use the arrow keys.
- Refresh keeps placed bets, favourites and balance. Unplaced picks and scenarios reset.

AI assistance and asset provenance are disclosed in `SUBMISSION.md`.
