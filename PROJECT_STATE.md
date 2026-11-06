# HOUSE//LIVE Project State

Updated: 2026-11-06 (Asia/Jakarta)

## Current outcome

All five linked views and the single-bet interaction engine are implemented. Local typecheck, lint, 21 behavioral tests and production build passed on 2026-11-06. Desktop and mobile browser scenarios passed. The relative-path production build and final mobile stake-focus regression passed; desktop and mobile screenshots are saved.

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
- [ ] Enable GitHub Pages, run hosted CI and verify the public URL.
- [ ] Owner review and authorization to submit.

## Access and deployment blockers

The owner created the public GitHub repository and subsequently requested Deploy from a branch. The publishing target is `gh-pages` / (root); custom Actions deployment has been removed. Source is published; the latest inspected hosted run `42080493828` still failed before application checks ran. The owner-supplied annotation establishes an account-level runner restriction. Owner action is required to restore hosted execution. No public deployment is claimed.

The terminal environment recovered. A further quality pass corrected live markets whose outcomes were already decided, consistent no-live labels, home-navigation filters, persistent-session validation and keyboard navigation in My Bets. The exact esbuild build-script approval is now recorded in `pnpm-workspace.yaml`, preventing a separate dependency-installation failure.

Local browser access is currently unavailable. Earlier desktop/mobile screenshots remain reference evidence, not screenshots of this final patch. Repeat the affected UI scenarios after browser or public-host access is restored.

GitHub remains the source of truth and hosting target. Do not switch hosting providers without the owner's direction.

## Scope decision

The latest official screenshots override the earlier request for match statistics: stats widgets and match trackers are excluded. No excluded feature has been implemented.

## Next execution steps

1. Publish the locally validated static output to `gh-pages`.
2. Set Pages to Deploy from a branch → gh-pages → / (root).
3. Verify the internal Pages deployment, manifest and all five public routes. If the account restriction persists, the owner must resolve it.
4. Repeat the updated no-live, home-navigation, keyboard and refresh scenarios in the browser.
5. Obtain and reconcile the official starter shell and brand pack.
6. Update `SUBMISSION.md` with the verified URL and fresh screenshots; obtain owner approval before submission.

## Deadline

Official screenshot: 14 November 2026, 18:00 UTC = 15 November 2026, 01:00 WIB. No contest entry has been sent. The contest permits three submissions per day. The owner must review the winning-entry rights transfer before submission.
