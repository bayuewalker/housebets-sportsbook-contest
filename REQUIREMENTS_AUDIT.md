# HOUSE//LIVE — Requirements Audit

Audit date: 7 November 2026 (Asia/Jakarta). Owner: bayuewalker.

## Verdict

The implemented product covers the five required views, single-bet workflow, demo states and excluded-feature boundaries. It is publicly deployed. **Full contest compliance is not yet signed off:** exact-width browser regression on the final release remains incomplete, and the official starter shell/brand pack has not been inspected or integrated. Functional coverage is not a claim of a competition-winning score.

## Source of requirements and evidence

The three official brief screenshots supplied by the owner are the authoritative checklist. They explicitly exclude statistics widgets and match trackers; the earlier expanded request for match statistics does not override that exclusion. The match scoreboard and clock are retained.

Audited application source: deployed commit `e62bab273940f32d02aebc894db44c4f5888e822`. Publishing branch: `gh-pages`, commit `ad56245f919656cec22707e6c256bcc19cffe8f8`. Documentation checkout at audit start: `0da8d1c1f2ba09be29c3e7d28ac4669fd28d3728`. This audit makes no application changes.

Evidence levels:

- **Verified:** implementation plus automated or recorded browser evidence.
- **Implemented:** source verified, but not every relevant control was exercised in this audit.
- **Partial:** some evidence exists, with a specific remaining requirement.
- **Unverified:** required original material or final acceptance evidence is unavailable.

## Requirement matrix

| Requirement | Status | Evidence / limit |
| --- | --- | --- |
| Five pages, interconnected | Verified | `/sports`, `/live`, `/football`, `/match/ars-bha`, `/bets` hash routes; public navigation smoke test |
| Sports Home: Live now | Verified | Live groups and count; fixture scores, clocks and odds |
| Sports Home: Starting soon | Verified | Upcoming grouped fixtures; UTC kickoff labels |
| Sports Home: Top competitions | Verified | All five required football leagues link to fixtures |
| Sports Home: Sports navigation | Verified | Football, tennis, basketball and esports; All sports reset |
| Search teams, players, competitions and markets | Verified | Four search dimensions covered by behavioral test; public player search and empty results exercised |
| Featured matches | Verified | Featured fixture cards and Arsenal main event |
| Follow teams and competitions | Verified | Toggle implementation and persisted favorites; earlier browser following checks; away-team follow available in Match Center |
| Live: every in-play sample match | Verified | All four sample live fixtures included by default |
| Live: sport and competition filters | Verified | Combined filter logic; recorded sport/competition browser checks |
| Live: score and clock | Verified | Score/clock labels for every live sample; Arsenal clock advances each second |
| Live: nothing live shows Starting soon | Verified | Public no-live scenario showed fallback and consistent upcoming Match Center labels |
| Football: Premier League, Champions League, LaLiga, Serie A, Bundesliga | Verified | Fixture data, automated league assertion and public page inspection |
| Football: match-result odds on every row | Verified | Each of the six football fixtures uses its three-outcome result market |
| Match: live Arsenal v Brighton, score and clock | Verified | Public Match Center, 2–1 sample score, running clock and competition |
| Match: Popular, Goals, Halves, Handicaps, Goalscorers, Corners & Cards | Implemented | All six category controls and corresponding markets present; category coverage test; Popular/Goals exercised in latest public pass, remaining categories need final control sweep |
| Match: odds movement | Verified | Demo movement changes quote and direction indicators; acceptance tests and public flow |
| Match: suspended markets | Verified | Pre-suspended cards market; scenario suspend/reopen; disabled odds and retained selection |
| Betslip and My Bets share one page | Verified | `/bets` contains both sections; rail and mobile panel supplement that page |
| Tap odds to add/remove picks | Verified | Toggle behavior test, public selection flow and explicit removal implementation |
| Singles only | Verified | Each selected outcome creates an independent bet; returns summed, never multiplied; no accumulator mode |
| Decimal odds and USDT stakes | Verified | Two-decimal displayed prices, USDT inputs/labels, decimal calculations |
| Stake entry and potential return | Verified | Valid/invalid boundary tests; 25 × 1.48 = 37 and 25 × 1.60 = 40 in public browser |
| Changed odds require explicit acceptance | Verified | Placement rejects mismatched accepted/current odds; public Accept new odds gate |
| Suspended selection handling | Verified | Selection retained; placement blocked until reopen or removal |
| Successful/failed placement | Verified | Failure leaves balance/history untouched; successful retry debits once and displays receipt |
| My Bets: Open, Settled, Cash Out | Verified | Public open/settled records, confirmation modal, 23-USDT cash-out credit and keyboard tab navigation |
| Discreet scenario controls | Implemented | Odds, suspension, failure, settlement, no-live, loading and reset controls; core states publicly exercised; loading requires final browser check |
| Loading and empty states | Implemented | Two-second loading control; search/filter/history empty states; public search and no-live empty cases verified |
| Desktop at 1440px | Partial | 5 November iframe check passed; final-release exact-width regression interrupted by preview access failure |
| Mobile at 390px | Partial | 5 November 390×844 iframe check passed; final-release exact-width regression remains incomplete |
| Persistent mobile bottom betslip bar and interactive panel | Partial | Fixed bar, safe-area padding and native dialog implemented; earlier mobile placement/focus checks passed; final-release check outstanding |
| Top bar, left navigation, side panel | Partial | Required structure present and visible on desktop; exact official-shell preservation cannot be established without starter files |
| Housebets brand identity | Unverified | Navy/aqua direction matches supplied references; wordmark/wave and team monograms are provisional, not official brand-pack assets |
| Frontend only, sample data, no player accounts or real money | Verified | In-memory/localStorage demo; no account, payment, betting or backend integration |
| Public URL without login | Verified | Public page and release checksum verification; branch publishing configured correctly |
| No multis/accumulators, bet builder, boosts, free bets, promos, outrights, specials, stats widgets, trackers or AI search | Verified | Source/interaction review found none of the excluded features |
| Big Idea of 80–800 characters | Verified | Submission draft is 504 characters |
| Tools/templates disclosure including AI assistance | Verified | Submission draft names ChatGPT/Codex, TypeScript, Vite, fonts, original UI assets and provisional branding |
| Desktop/mobile screenshots and final QA report | Partial | Earlier 1440/390 images and current public desktop image exist; exact-width images need refreshing |
| Contest entry requires owner approval | Verified | No entry submitted and no ownership-transfer acknowledgement accepted |

## Checks rerun during this audit

- `pnpm test`: **21 passed, 0 failed**.
- `pnpm lint`: **passed**.
- `pnpm build`: **passed**, including `tsc --noEmit`.
- Build output names remain `index-BoatZmCh.js` and `index-CnKcR-9N.css`, matching the deployed application assets.
- Source inspection confirms responsive breakpoints at 1250px, 1050px and 760px, reduced-motion support, visible focus indicators, mobile safe-area padding and bottom-sheet sizing. These checks do not replace a browser layout test.

## Acceptance gaps, ordered by consequence

1. **Official shell and brand pack.** The brief explicitly asks for the provided site shell. The custom wordmark/wave is not a verified replacement. Obtain the official starter ZIP or direct asset link, integrate it, and compare desktop/phone shell behavior. This affects the 15-point Housebets-alignment category and the tie-breaker; no numeric score is claimed.
2. **Final responsive regression.** Repeat all five routes at 1440px and 390px, exercise mobile stake editing, changed/suspended/failed states, bottom-sheet navigation and placement, and capture fresh screenshots. The earlier evidence remains valid for its recorded build only.
3. **Remaining control sweep.** Exercise all six market-category tabs, all scenario controls including loading and settlement, every sport/competition filter, remove/clear actions and modal close/back behavior on the final release. The core paths passed, but “every control tested” is not established.

## Browser verification limit

During this audit the supported preview initially opened successfully. After a runtime interruption the preview service was stopped; restarting it returned a running URL, but the subsequent browser action was rejected by browser security policy. No alternate browser surface, raw protocol access or network workaround was used. The final exact-width checks remain unverified, rather than being marked passed from CSS alone.

## Submission decision

Keep the entry in review. The public prototype can be shared for feedback now, but full submission-ready status requires closing the gaps above and obtaining the owner's explicit approval. Contest deadline from the supplied brief: 14 November 2026, 18:00 UTC / 15 November 2026, 01:00 WIB.
