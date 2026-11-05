# HOUSE//LIVE Design System

## Product idea

The sports command center: familiar Housebets structure, a match-focused content area, and an always-reachable betslip. The interaction hierarchy is event → market → price → stake → reviewed confirmation.

## Tokens

| Role | Value | Usage |
| --- | --- | --- |
| Canvas | `#071218` | Page background |
| Surface | `#0C1C25` | Shell and panels |
| Raised surface | `#122833` | Cards and controls |
| Divider | `#20343D` | Panel boundaries |
| Primary text | `#ECF3F5` | Headlines and values |
| Secondary text | `#8EA7B2` | Supporting labels |
| Primary action | `#B4F3ED` | Selected odds and placement |
| Live accent | `#54D9CE` | Live indicators and active navigation |
| Warning | `#EDC77C` | Changed odds and suspended selections |
| Error | `#FF9CAA` | Validation and failed placements |

Manrope is used for headings; DM Sans for interface text. Both use system sans-serif fallbacks. Prices, balances and clocks use tabular numerals. Radii range from 4px controls to 12px feature cards. Spacing uses predominantly 4/8px increments.

## Responsive shell

- Desktop 1440px: 204px left navigation, fluid content, 310px persistent betslip rail.
- At 1050px and below: rail becomes the persistent bottom betslip and modal sheet.
- At 760px and below: left navigation becomes a drawer; market and sport navigation scroll horizontally; fixture rows reflow without horizontal page overflow.
- Mobile target: 390px. Safe-area bottom padding protects the betslip on devices with a home indicator.

## Component behavior

| Component | Normal | Selected / changed | Unavailable |
| --- | --- | --- | --- |
| Odds button | Navy, readable outcome and decimal value | Aqua selection; directional arrow and changed price | Lock icon, disabled button, explicit suspended label |
| Selection | Market, event, accepted odds, stake, individual return | Amber old/new comparison; acceptance button | Selection remains saved, placement disabled |
| Placement | Reviewable sum of stakes and individual returns | Loading state prevents repeat click; receipt after success | Explicit failure; no debit; retry preserves choices |
| Cash out | Quote visible on eligible open bets | Confirmation dialog before settlement | Closed records cannot cash out twice |
| Following | Outline star with accessible label | Filled tint; reversible follow/unfollow | Empty state explains how to add teams |

## Accessibility

Native buttons, links, inputs, selects and dialogs; labelled stake inputs; visible focus rings; pressed/selected state announcements; textual status alongside color; live-region receipts and failures; keyboard skip link; reduced-motion support. Native dialogs trap focus and support Escape. Search can be focused with `/` when not editing another field.

Desktop follows the density of the supplied wireframe. Mobile increases stake fields and actions, and keeps betting state reachable from every page. Actual iOS/Android keyboard behavior and comprehensive assistive-technology testing remain release checks.

## Assets and alignment

All interface SVG icons, backgrounds and club monograms are original code-based assets. No template, stock photo, official team crest or official Housebets logo file is bundled. The Housebets wordmark and wave are provisional interpretations of the screenshots. Official starter shell/brand-pack reconciliation is a required final milestone, especially because brand alignment is a contest tie-breaker.
