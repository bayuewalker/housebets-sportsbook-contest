# HOUSE//LIVE Project State

Updated: 2026-11-07 (Asia/Jakarta)

## Current outcome

All five linked views and the single-bet interaction engine are implemented. Local typecheck, lint, 21 behavioral tests and production build passed on 2026-11-06. Browser scenarios and saved screenshots cover the earlier 2026-11-05 build. The subsequent quality patch still requires browser regression checks; no final-release browser pass is claimed.

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
- [ ] Verify branch-based Pages publication and the public URL.
- [ ] Owner review and authorization to submit.

## Access and deployment blockers

The owner requested Deploy from a branch and reports having saved the Pages setting. The publishing target is `gh-pages` / (root); the custom Actions workflow has been removed. The publishing branch was retriggered once at `ad56245f919656cec22707e6c256bcc19cffe8f8`, preserving the validated release files.

The latest verification on 2026-11-07 (WIB) found the public manifest returning HTTP 404, no repository deployments, and no new Pages workflow run. The latest visible run remains the old custom workflow `42134155517`, which failed before application checks. The previously supplied annotation established an account-level runner restriction at that time. The cause of the missing branch deployment is not yet confirmed; do not assume that the reported Pages setting is wrong or that this retry failed for the same reason.

The connector can write repository files but cannot inspect or update Pages administration settings. Browser settings access was signed out. A screenshot of the current Pages source, branch, folder and status is needed to distinguish configuration from a service restriction. A PAT is not needed for repository pushes; never put one in source or chat.

The terminal environment recovered. A further quality pass corrected live markets whose outcomes were already decided, consistent no-live labels, home-navigation filters, persistent-session validation and keyboard navigation in My Bets. The exact esbuild build-script approval is now recorded in `pnpm-workspace.yaml`, preventing a separate dependency-installation failure.

Local browser access is currently unavailable. Earlier desktop/mobile screenshots remain reference evidence, not screenshots of this final patch. Repeat the affected UI scenarios after browser or public-host access is restored.

GitHub remains the source of truth and hosting target. Do not switch hosting providers without the owner's direction.

## Branch release verification

`pnpm pages:prepare` passed lint, all 21 tests, TypeScript and production build. The branch contains only `index.html`, JavaScript/CSS assets, `favicon.svg`, `.nojekyll` and `build-info.json`. Custom deployment workflows are removed from main. Pages settings could not be changed through the connector; browser settings access requires sign-in. The owner reports that Pages is configured. The saved source, branch, folder and deployment status remain unverified through the available tooling. `pnpm pages:verify` now checks the hosted manifest and each public asset checksum against a pinned publishing-branch commit; it correctly reports the current HTTP 404 as failure. Publication remains unverified until the hosted manifest matches the release.

## Scope decision

The latest official screenshots override the earlier request for match statistics: stats widgets and match trackers are excluded. No excluded feature has been implemented.

## Next execution steps

1. Static output is published to `gh-pages` at `ad56245f919656cec22707e6c256bcc19cffe8f8` (unchanged release tree from `faac5ea087c172ffb7b39e285366f36abe5c50ea`) from source `e62bab273940f32d02aebc894db44c4f5888e822`. All six remote files were verified byte-for-byte against the local release.
2. Inspect the current Pages setting and deployment status; the owner reports the setting is saved. Do not issue further blind retry commits.
3. Once Pages publishes, run `pnpm pages:verify`, then verify all five public routes. Resolve any account restriction if a new deployment explicitly reports one.
4. Repeat the updated no-live, home-navigation, keyboard and refresh scenarios in the browser.
5. Obtain and reconcile the official starter shell and brand pack.
6. Update `SUBMISSION.md` with the verified URL and fresh screenshots; obtain owner approval before submission.

## Deadline

Official screenshot: 14 November 2026, 18:00 UTC = 15 November 2026, 01:00 WIB. No contest entry has been sent. The contest permits three submissions per day. The owner must review the winning-entry rights transfer before submission.
