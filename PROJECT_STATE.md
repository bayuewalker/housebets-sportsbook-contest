# HOUSE//LIVE Project State

Updated: 2026-11-12

## Current outcome

**SUBMISSION READY — awaiting owner approval.** All five linked pages, the single-bet engine and every required state are implemented. They pass 29 behavioural tests, 178 browser checks at exactly 1440px and 390px, and a 36-check stress and responsive sweep from 320px to 1920px. Nothing has been submitted to the contest.

## Milestones

- [x] Read the brief and official screenshots; identify exclusions.
- [x] Implement Sports Home, Live, Football, Match Center and combined Betslip + My Bets.
- [x] Implement changed odds, suspension, failure/retry, settlement, cash out, loading and no-live states.
- [x] Publish to GitHub Pages from `gh-pages` / (root) and verify (7 November).
- [x] Finishing pass (8 November): Housebets-style shell and brand mark, phone bottom navigation, 11px text floor, receipts, retry, simulated live price feed, focus handling, and exact-width browser QA with screenshots.
- [x] Final contest audit (12 November): reread the live scorecard; kept stats/trackers out of scope; strengthened Match navigation and sticky categories, changed-odds return review, Cash Out differentiation and touch targets.
- [x] Correct contest rules and asset provenance in the docs.
- [x] Merge the finishing pass to `main`, republish `gh-pages` and verify the public site.
- [ ] Owner review, approval and submission (owner only).

## Release record

| Release | Source (`main`) | `gh-pages` | Verification |
| --- | --- | --- | --- |
| 7 November | `694b3ad47b8efade6b4fedd89bd69221d60a7e73` | `00de1670c55929ee5917fa08f06d32d40ff5e794` | `pnpm pages:verify` pass; public desktop sweep |
| 8 November finishing pass ([PR #3](https://github.com/bayuewalker/housebets-sportsbook-contest/pull/3)) | `22fc71610434c3ef4c2cb7fc435ec3dec0a7d8c4` | `fb0c377f75b2ccc8354fa1e26d8281e5700351d4` | `pnpm pages:verify` pass (4 public assets); `QA_URL=… pnpm qa:browser` 164/164 against the public site |
| 12 November final contest pass ([PR #5](https://github.com/bayuewalker/housebets-sportsbook-contest/pull/5)) | `b26c52f547839cd6bdef6185c2241cfad768cd26` | `38b9a5982fc64f5a9fb3155b0eeebb6ae89a8aa7` | `pnpm pages:verify` pass (4 public assets); `QA_URL=… pnpm qa:browser` 176/176 against the public site |

Later documentation-only commits on `main` do not change the published app.

Publishing: build from a clean checkout of `main`, run `pnpm pages:prepare`, copy `.pages/` to the `gh-pages` root (removing obsolete hashed assets), commit and push without force, then run `pnpm pages:verify`. No custom Actions deployment, and no secrets or tokens in the repository.

## Contest facts

- Deadline: **14 November 2026, 18:00 UTC** (15 November 2026, 01:00 WIB).
- Free entry with no deposit or wagering. At most 3 submissions in any rolling 24 hours. One account per person. Residents of the US, France and the Netherlands are excluded.
- Original work. AI tools and public libraries are allowed if disclosed. Entries may be shared publicly under the entrant's alias.
- Prize paid in USDT with no wagering. Results about 7 days after closing. Winners transfer code and design rights; non-winners keep their work.
- Tie-breakers: the Match page, then "Feels like Housebets".
- The contest page mentions starter files, but no downloadable ZIP or brand pack was located. This is not a blocker: the entry uses original assets and says so.

## Branch notes

- `codex/contest-finishing` (commit `9cf8ce7`, 8 November) holds a separate, unmerged attempt at shell and mobile refinements with no open PR. The finishing pass on `cursor/contest-finishing-a1e1` was built independently from `main` and covers the same areas. The owner should decide whether to delete that branch; nothing from it was merged.
- `fix/contest-qa-finalization` and `docs/record-release-verification` were merged earlier through PRs #1 and #2.

## Open risks

- Brand fidelity: without official assets, "Feels like Housebets" rests on the original interpretation.
- Not tested on physical devices, Safari/Firefox or with a screen reader.
- Google Fonts needs network access; system fonts take over if it fails.

## Next step

The owner reviews the live site and `SUBMISSION.md`, chooses whether to submit, and personally ticks the contest confirmations, including the IP transfer for winners.
