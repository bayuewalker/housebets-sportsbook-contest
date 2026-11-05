# HOUSE//LIVE Project State

Updated: 2026-11-06 (Asia/Jakarta)

## Current outcome

All five linked views and the single-bet interaction engine are implemented. Local typecheck, lint, 17 engine tests and production build passed on 2026-11-05. Desktop and mobile browser scenarios passed. The relative-path production build and final mobile stake-focus regression passed; desktop and mobile screenshots are saved.

## Milestones

- [x] Read the supplied brief and official screenshots; identify exclusions.
- [x] Define architecture, tokens, routes and sample data.
- [x] Implement Sports Home, Live and Football.
- [x] Implement Match Center with six market groups.
- [x] Implement combined Betslip + My Bets and mobile bottom sheet.
- [x] Implement changed odds, suspension/reopening, failure/retry, settlement and cash out.
- [x] Add behavioral tests and local browser QA.
- [x] Prepare GitHub Pages workflow and relative asset paths.
- [x] Write project, design, QA and submission documentation.
- [ ] Obtain and compare the official starter shell and brand pack.
- [x] Access `bayuewalker/housebets-sportsbook-contest` (public, owner-created).
- [x] Push source and verify remote commit `30e912573a90ed9496fa1a037e123b6d30625ead`.
- [ ] Enable GitHub Pages, run hosted CI and verify the public URL.
- [ ] Owner review and authorization to submit.

## Access and deployment blockers

The owner created the public GitHub repository. The connector confirms admin and push access. The initial source push succeeded. Workflow run `42079919726` failed in the validate job before any steps executed; the jobs API returned an empty steps list and the log endpoint returned BlobNotFound. The root cause is unconfirmed. GitHub Pages enablement and deployment remain unverified. The connector does not expose Pages administration; browser sign-in previously timed out.

Vercel project creation returned `402 resource_creation_blocked` for WMOS-WARP. The owner subsequently selected GitHub only. An empty alternative-host project was provisioned during the earlier fallback attempt, but no source was pushed and no version was published. Do not continue that deployment path.

The execution environment became unavailable during deployment investigation, stopping local commands and browser access. Source, tests, workflow, documentation and screenshots are safely stored in GitHub; no public deployment is claimed.

## Scope decision

The latest official screenshots override the earlier request for match statistics: stats widgets and match trackers are excluded. No excluded feature has been implemented.

## Next execution steps

1. Source/screenshot package prepared; owner-created GitHub repository is accessible.
2. Inspect the annotation on Actions run `42079919726` and resolve the runner-level failure before retrying.
3. Push the reviewed source and configure Pages through GitHub Actions.
4. Verify unauthenticated access to all five hash routes and representative betting states.
5. Replace provisional branding using the official starter assets when available.
6. Update `SUBMISSION.md` with the verified URL; wait for owner approval before any contest submission.

## Deadline

Official screenshot: 14 November 2026, 18:00 UTC = 15 November 2026, 01:00 WIB. No contest entry has been sent. The contest permits three submissions per day. The owner must review the winning-entry rights transfer before submission.
