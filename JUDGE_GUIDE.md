# HOUSE//LIVE review walkthrough

All data and transactions are simulated. No login, deposit or account is needed. The public deployment is still pending; do not use an internal preview URL as the contest entry.

## A two-minute product tour

1. **Sports Home:** search for Arsenal, Bukayo, Premier League or a market. Clear search; follow a competition and open Following. Explore a sport and return home.
2. **Live:** filter sport and competition. Open Demo controls and choose No live matches to see the Starting Soon fallback. Restore live matches before continuing.
3. **Football:** visit each of the five competition tabs. Follow a team or league; open a fixture from its match row.
4. **Match Center:** open Arsenal v Brighton. Browse all six market categories. Select Arsenal at 1.48 and enter a stake of 25 USDT: potential return is 37.00 USDT.
5. **Betslip + My Bets:** review the single bet, place it and inspect the confirmation and open history. Confirm Cash out and find the result in Settled. On mobile, use the persistent bottom bar to open the interactive betslip.

## Judge-controlled edge states

The desktop sidebar's Demo controls button and the mobile sliders button open the same scenario panel. Price and suspension controls target the first selection, or Arsenal's match-result market when the slip is empty.

| Scenario | Expected result |
| --- | --- |
| Move odds | Current price changes; placement stays disabled until Accept new odds is pressed. A 25 USDT stake at 1.60 returns 40.00 USDT. |
| Suspend / reopen | Suspended odds are disabled. Existing picks and stakes remain, but placement is blocked. Toggle again to reopen. |
| Fail next placement | The next valid placement fails with an explanation, without changing balance or history. Retry succeeds. |
| Settle an open bet | The first open bet moves to Won and its return is credited once. |
| No live matches | Live shows Starting Soon; former live fixtures have upcoming labels and no live scoreboard. |
| Loading state | The fixture list shows a two-second loading state, then returns. |
| Reset demo | A confirmation restores sample history, favorites and 1,000 USDT. |

## Additional checks

- Multiple selections remain independent singles with separate stakes and receipts; odds are never multiplied.
- Invalid or unaffordable stakes block placement. Removing a pick recalculates totals.
- Refresh preserves placed bets, favorites and demo balance. Unplaced selections and scenario overrides reset.
- My Bets tabs support Left/Right arrows, Home and End. Search has a `/` shortcut; dialogs support Escape.
- Verify at 1440px desktop and 390px phone width. Check keyboard focus, bottom-bar visibility, scroll overflow and close/reopen behavior.

AI assistance and asset provenance are disclosed in `SUBMISSION.md`. The owner must approve the contest entry; this guide is not a submission confirmation.
