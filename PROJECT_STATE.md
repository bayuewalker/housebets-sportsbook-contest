# Housebets Sports — Project State

Updated: 2026-11-12

## Current outcome

**Redesign ready for owner review** on branch `cursor/housebets-redesign-a1e1`. It passes 35 unit tests, 158 browser checks at exactly 1440px and 390px, and a 52-check stress and responsive sweep from 320px to 1920px. It is not merged, the public site still shows the previous release, and nothing has been submitted to the contest.

## Milestones

- [x] Read the brief and official screenshots; identify exclusions.
- [x] Implement the five linked pages, the single-bet engine and every required state (5–8 November, working name HOUSE//LIVE).
- [x] Publish to GitHub Pages from `gh-pages` / (root) and verify (releases below).
- [x] Redesign (12 November): fictional players; Poisson-priced markets (94 on Arsenal v Brighton, at least 60 pre-match and 40 live); 42 fixtures with 13 live; Housebets shell with the official wordmark and mark, Figtree and Red Hat Display, icon rail, Weekly Prize, VIP crown and Bet slip / My bets / Chat panel; dense home; pinned phone slip footer; empty stake with chips; My bets table with filters and cash-out history; odds arrows, local time zone, modular `src/ui/`, 44px phone targets.
- [x] Rewrite browser and stress QA for the redesign; refresh screenshots; `TOOLS.md`; Big idea draft.
- [x] Align the top bar, left rail and side panel with the brand pack in `brand/` (official wordmark and mark).
- [ ] Owner review and merge of the redesign PR.
- [ ] Publish the merged build to `gh-pages` and re-run `pages:verify` and both QA scripts against the public URL.
- [ ] Owner approval and submission (owner only).

## Release record

| Release | Source (`main`) | `gh-pages` | Verification |
| --- | --- | --- | --- |
| 7 November | `694b3ad47b8efade6b4fedd89bd69221d60a7e73` | `00de1670c55929ee5917fa08f06d32d40ff5e794` | `pnpm pages:verify` pass; public desktop sweep |
| 8 November finishing pass ([PR #3](https://github.com/bayuewalker/housebets-sportsbook-contest/pull/3)) | `22fc71610434c3ef4c2cb7fc435ec3dec0a7d8c4` | `fb0c377f75b2ccc8354fa1e26d8281e5700351d4` | `pnpm pages:verify` pass (4 public assets); `QA_URL=… pnpm qa:browser` 164/164 against the public site |
| 12 November final contest pass ([PR #5](https://github.com/bayuewalker/housebets-sportsbook-contest/pull/5)) | `b26c52f547839cd6bdef6185c2241cfad768cd26` | `38b9a5982fc64f5a9fb3155b0eeebb6ae89a8aa7` | `pnpm pages:verify` pass (4 public assets); `QA_URL=… pnpm qa:browser` 176/176 against the public site |
| 12 November stability fix ([PR #7](https://github.com/bayuewalker/housebets-sportsbook-contest/pull/7)) | `757d1a5950c19f9af390745b4460c5a3ad1fc8f0` | `b0470f5baa21c08f54f2eb2e7f5c06c4b1ac9235` | `pnpm pages:verify` pass; `qa:browser` 178/178 and `qa:stress` 28/28 against the public site |
| 12 November responsive fix ([PR #8](https://github.com/bayuewalker/housebets-sportsbook-contest/pull/8)) | `2bea9c501c02b85b43619dad3153f48057ae5fe9` | `3a3eb3566e22f5092d61d6d4e01f5896fde7f0e4` | `pnpm pages:verify` pass; `qa:browser` 178/178, `qa:stress` 36/36 and 26-viewport audit (0 findings) against the public site |

All releases above are the previous design. Later documentation-only commits on `main` do not change the published app.

Publishing: build from a clean checkout of `main`, run `pnpm pages:prepare`, copy `.pages/` to the `gh-pages` root (removing obsolete hashed assets), commit and push without force, then run `pnpm pages:verify`. No custom Actions deployment, and no secrets or tokens in the repository.

## Contest facts

- Deadline: **14 November 2026, 18:00 UTC** (15 November 2026, 01:00 WIB).
- Free entry with no deposit or wagering. At most 3 submissions in any rolling 24 hours. One account per person. Residents of the US, France and the Netherlands are excluded.
- Original work. Public libraries, models and tools are fine if named in the note. Entries may be shared publicly under the entrant's alias.
- Prize paid in USDT with no wagering. Results about 7 days after closing. Winners transfer code and design rights; non-winners keep their work.
- Tie-breakers: the Match page, then "Feels like Housebets".
- The brand pack is in `brand/` (`logo.svg` wordmark, `mark.svg`). The top bar, left rail and side panel use it.
- Out of scope: multis, accumulators, bet builder, boosts, free bets, promos, outrights, specials, stats widgets, match trackers and AI search. Bet slip and My bets stay on one shared page/panel.

## Open risks

- Not tested on physical devices, Safari/Firefox or with a screen reader.

## Next step

The owner reviews the redesign PR and screenshots, decides whether to merge and publish, and personally submits and ticks the contest confirmations, including the IP transfer for winners.
