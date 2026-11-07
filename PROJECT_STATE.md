# HOUSE//LIVE Project State

Updated: 2026-11-07 (Asia/Jakarta)

## Current outcome

All five linked views and the single-bet interaction engine are implemented. Local typecheck, lint, 21 behavioral tests and production build were rerun and passed on 2026-11-07. Browser scenarios and saved screenshots cover the earlier 2026-11-05 build. A subsequent public desktop regression pass on 7 November is recorded below; exact-width responsive checks still need refreshing.

## Milestones

- [x] Read the supplied brief and official screenshots; identify exclusions.
- [x] Define architecture, tokens, routes and sample data.
- [x] Implement Sports Home, Live and Football.
- [x] Implement Match Center with six market groups.
- [x] Implement combined Betslip + My Bets and mobile bottom sheet.
- [x] Implement changed odds, suspension/reopening, failure/retry, settlement and cash out.
- [x] Add behavioral tests and local browser QA.
- [x] Prepare relative asset paths and local validation for branch-based Pages.
- [x] Write project, design, QA and submission documentation.
- [ ] Obtain and compare the official starter shell and brand pack.
- [x] Access `bayuewalker/housebets-sportsbook-contest` (public, owner-created).
- [x] Push source and verify remote commit `30e912573a90ed9496fa1a037e123b6d30625ead`.
- [x] Publish the validated static release to `gh-pages`.
- [x] Verify branch-based Pages publication and the public URL.
- [ ] Owner review and authorization to submit.

## Published release and remaining verification

The public prototype is live at https://bayuewalker.github.io/housebets-sportsbook-contest/ without login. The owner's first Pages screenshot showed `main` selected; that served uncompiled source HTML. The owner then switched to `gh-pages` / (root), confirmed by the second screenshot. The deployment blocker is resolved. No PAT or custom Actions workflow was needed.

`pnpm pages:verify` passed on 7 November 2026 (WIB): the hosted manifest and all four public assets match source `e62bab273940f32d02aebc894db44c4f5888e822`, publishing commit `ad56245f919656cec22707e6c256bcc19cffe8f8`.

Public browser tests passed for all five routes, search and empty results, league filtering, home filter reset, odds-change acceptance, suspended/reopened selections, failed placement with unchanged balance, successful retry, cash-out settlement, keyboard history tabs, refresh persistence, no-live fallback and reset. The updated 3.5/4.5 goals markets were inspected. Desktop evidence is saved in `docs/screenshots/public-match-desktop.jpg`.

A second public desktop sweep on 7 November exercised all six Match Center market tabs, odds acceptance, failure/retry, suspension/reopen, cash-out, loading and no-live fallback. Source was then adjusted to close the Demo controls dialog when Fail next placement is armed. This source revision requires the normal branch-based publishing and post-publish verification; it does not by itself constitute final responsive or brand compliance.

The public browser viewport was 1363×936 CSS pixels (1348px document client width). This does not replace final 1440px and 390px checks. Earlier exact-width evidence remains dated 5 November. Official starter-shell/brand-pack comparison is still outstanding.

GitHub remains the source of truth and hosting target. Do not switch hosting providers without the owner's direction.

## Scope decision

The latest official screenshots override the earlier request for match statistics: stats widgets and match trackers are excluded. No excluded feature has been implemented.

## Requirements audit

See `REQUIREMENTS_AUDIT.md` for the complete screenshot-derived matrix. The audit confirms core functional coverage and records unresolved official-shell/brand compliance, final exact-width responsive checks and the remaining control sweep. The supported preview was interrupted; a subsequent browser action was blocked by browser security policy. No full-compliance sign-off is claimed.

## Next execution steps

1. Publish and verify the latest source revision via `gh-pages` / (root), without a custom Actions workflow.
2. Repeat final-release responsive QA and screenshots at 1440px and 390px, including the mobile bottom sheet and remaining control sweep.
3. Obtain and reconcile the official starter shell and brand pack.
4. Review the complete submission draft with the owner and obtain approval before submitting.

## Deadline

Official screenshot: 14 November 2026, 18:00 UTC = 15 November 2026, 01:00 WIB. No contest entry has been sent. The contest permits three submissions per day. The owner must review the winning-entry rights transfer before submission.
