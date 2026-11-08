# Contest finishing baseline — 7 November 2026

Baseline: main `cee34cd05e95bac6ca8361d9c473053eff82d9de`. Findings recorded before code edits.

## Preserve

Five connected routes, isolated single-bet engine, explicit price acceptance, suspended-market handling, failed placement without debit, retry, settlement/cash out and schema-validated local persistence. Existing 21 tests cover transactional invariants. Branch publishing is operational; no custom Actions workflow is needed.

## Actual finishing gaps

1. Mobile has a betslip bar and drawer but lacks the reference Menu / Sports / Casino / Chat / Search bottom navigation. Add safe informational destinations for excluded areas; never add casino play, messaging or account integrations.
2. Many supporting labels are 7–11px. Increase labels to at least 12px (badge initials may remain smaller), body text to 14px and input text to 16px on mobile. Reflow dense rows rather than clipping names or prices.
3. Wordmark uses a rotated text glyph for the wave. Replace it with an original SVG wave, retaining the cyan H and reference shell. Refine original team/competition badges. No official asset provenance claim.
4. Header has no profile affordance. Add a clearly simulated session information panel.
5. Full DOM replacement loses keyboard button focus and dialog opener focus. Restore focus across render and modal dismissal, preserve input caret and sheet scroll, and keep route-heading focus.
6. Search relies on browser-native clearing. Add an explicit labelled clear action.
7. Current exact-width screenshots predate the latest release. Test all five routes at 390px and 1440px and record any environment limitation accurately.
8. Documentation contains contradictory historic deployment statements, a mistaken mandatory starter-ZIP blocker, and “three per day” instead of a rolling 24-hour limit. Consolidate current evidence and correct the rules from the owner's supplied brief.

## Evidence and boundaries

All application source, test files and seven handoff documents inspected. Official page access remains unavailable; owner screenshots are the visual reference. The latest instruction explicitly permits original screenshot-based assets without waiting for the unlocated starter pack. This is a provenance limitation, not an automatic submission blocker. No official shell equivalence, contest score, physical-device keyboard result or screen-reader conformance is claimed without evidence.

Work proceeds on `codex/contest-finishing`; source remains on main and compiled release on gh-pages.
