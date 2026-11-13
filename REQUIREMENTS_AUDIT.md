# Housebets Sports — Requirements Audit

Audit date: 12 November 2026. Owner: bayuewalker. Branch: `cursor/housebets-redesign-a1e1`.

## Verdict

**Ready for owner review.** Every page, feature and state in the brief and the owner's redesign list is implemented and verified in a real browser at exactly 1440px and 390px (159 automated checks), plus a 52-check stress and responsive sweep and 35 unit tests. Publishing and submitting still depend on the owner. No score is claimed.

## Sources

- The public [contest page](https://www.housebets.com/contests/sportsbook-design) and the owner's screenshots of it: scorecard, Minimum bar wireframe, brief, out-of-scope list, deliverables and rules.
- The owner's redesign list (tasks 1–9 below) and out-of-scope list.

Evidence levels: **Verified** means source plus an automated browser or unit check. **Implemented** means source-reviewed only.

## Owner's redesign list

| Task | Status | Evidence |
| --- | --- | --- |
| 1. Fictional players only | Verified | Hand-written and generated fictional squads; repository search found no real player names; QA checks fictional names in the goalscorer table |
| 2. Match depth: groups plus All markets N, market search, collapsible cards, breadcrumb, compact sticky score on phones, suspended markets, live odds movement | Verified | Arsenal v Brighton has 100 markets (90–110). Every pre-match football fixture has at least 60 and every live one at least 40, including AC Milan v Roma. Groups include Players and Minutes; Goalscorers has at least 9 markets. QA checks the count, groups, search, collapse, breadcrumb and sticky score |
| 3. Housebets feel: official wordmark, Figtree and Red Hat Display, slim icon rail, Weekly Prize and VIP crown, Bet slip / My bets / Chat panel, sport tabs under search, Favourites chips | Verified | The shell uses `brand/logo.svg` and `brand/mark.svg`. QA checks the official wordmark, both fonts, the crown, the prize and the panel |
| 4. Data density: about 13 live (6 football), 3–10 matches in each of five leagues, inline suspended rows, HT, flags, accurate counts; Soccer market dropdown and Live & Upcoming / All | Verified | 42 fixtures, 13 live (6 football), leagues 8/5/6/5/5; QA checks counts, flags, HT, suspended rows, dropdown and toggle |
| 5. No marketing copy; dense phone home (Favourites, Your matches, Featured, Upcoming) | Verified | QA checks old copy is absent and the section order |
| 6. Phone slip: Accept odds / Place bet pinned to the bottom; toasts never cover the slip bar | Verified | QA measures the footer, Place and Accept positions and the toast against the bar |
| 7. Stake starts empty, quick-stake chips | Verified | Unit test and QA |
| 8. My bets table: Placed / Bet / Odds / Stake / Returns / Result, date and sport filters, expandable rows, highlighted wins, cash-out history in Settled | Verified | QA checks columns, filter options and effects, expansion and the cash-out sentence |
| 9. Odds flash with arrows, local time zone, `main.ts` split into modules, focus states, aria-labels, 44px targets | Verified | QA checks arrows, time-zone note, `aria-label` on every odds button, focus ring and phone target sizes; `src/main.ts` is now an entry point over `src/ui/` modules |

## Contest scorecard coverage

| Category | What the entry offers |
| --- | --- |
| Home | Sport tabs under search, Favourites, Your matches, Featured carousel, Live now, Starting soon, Top competitions, search with match reasons |
| Live | 13 events grouped by sport and league, flags, ticking clocks, HT, suspended rows, sport and competition filters |
| Football | Five leagues, league chips, market dropdown, Live & Upcoming / All |
| Match | Back button and breadcrumb, scoreboard, Popular, Goals, Halves, Handicaps, Goalscorers, Corners & cards, Players and Minutes plus All markets, search, collapse, goalscorer table, suspended markets, moving prices, phone compact score |
| Bet slip & My bets | One shared page and panel; singles only; empty stake with chips; changed-odds acceptance; suspended, failed and placed states; receipts; table with filters, expandable rows and cash out |
| Feels like Housebets | Housebets shell structure and palette, Figtree and Red Hat Display, Weekly Prize and VIP crown |
| Every state | Loading, empty search, no live, odds changed, suspended, failed, placing, placed, cash-out confirmation, settled, empty slip, invalid stake |

## Brief and rules

| Requirement | Status | Evidence / limit |
| --- | --- | --- |
| Five linked pages | Verified | `#/sports`, `#/live`, `#/football`, `#/match/:id`, `#/bets` |
| 1440px and 390px | Verified | No overflow; QA at both widths plus nine more viewports |
| Phone slip as a bottom bar | Verified | Slip bar above the bottom navigation, opening a sheet |
| Bet slip and My bets on one shared page / panel | Verified | `#/bets` and the side panel / sheet tabs |
| Singles only, decimal odds, USDT | Verified | Unit tests: returns summed, never multiplied |
| Frontend only, sample data | Verified | No backend, accounts, payments or betting API |
| Out of scope absent: multis, accumulators, bet builder, boosts, free bets, promos, outrights, specials, stats widgets, match trackers, AI search | Verified | None present |
| No imitation of other sportsbooks | Implemented | Built from the contest wireframes and Housebets look only |
| Big idea 80–800 characters | Verified | 787 characters in `SUBMISSION.md` |
| Tools, libraries and models named | Verified | `TOOLS.md` and `SUBMISSION.md` section 4 |
| Shell follows the official starter files / brand pack | Verified | Official wordmark and mark from `brand/`; top bar, left rail and side panel use the pack cyan and 8px radii |
| Physical devices, Safari/Firefox, screen reader | Not tested | Listed as a limitation |
| Publishing and submission | Published through PR #12; this correction is not published yet | Live site is gh-pages `654a2b1` (source `9724145`). No contest entry has been submitted, and the IP transfer has not been accepted on the owner's behalf |

## Checks run for this audit

- `pnpm typecheck`, `pnpm lint`, `pnpm build`: pass.
- `pnpm test`: 37 passed, 0 failed.
- `pnpm qa:browser`: 192/192 (local build).
- `pnpm qa:stress`: 52/52 (local build).

The 12 November redesign audit above recorded 35 tests and 159 browser checks. Those figures describe that pass, not this correction.
