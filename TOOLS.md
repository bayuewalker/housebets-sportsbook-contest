# Tools, libraries, models and assets

The contest allows public libraries, models and tools as long as the entry names them. This is the complete list for this entry. The same list appears in the entry note in `SUBMISSION.md`.

## Shipped in the prototype

| Name | Version | Licence | Role |
| --- | --- | --- | --- |
| [@fontsource-variable/figtree](https://fontsource.org/fonts/figtree) (Figtree by Erik Kennedy) | 5.3.0 | SIL OFL 1.1 | Interface text, self-hosted from the build |
| [@fontsource-variable/red-hat-display](https://fontsource.org/fonts/red-hat-display) (Red Hat Display by Red Hat / MCKL) | 5.3.0 | SIL OFL 1.1 | Headings, scores and the wordmark, self-hosted from the build |

No UI framework, component library, sportsbook template, UI kit, icon set, stock photo or external font CDN is used. The app makes no network requests besides its own static files.

## Build and development (not shipped)

| Name | Version | Role |
| --- | --- | --- |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.3 | Source language and type checking |
| [Vite](https://vite.dev/) | 8.0.13 | Dev server and production bundler |
| [ESLint](https://eslint.org/) with [@eslint/js](https://www.npmjs.com/package/@eslint/js) | 9.39.4 | Linting |
| [typescript-eslint](https://typescript-eslint.io/) | 8.59.3 | TypeScript lint rules |
| [tsx](https://tsx.is/) | 4.22.1 | Runs the TypeScript unit tests on the Node.js test runner |
| [@types/node](https://www.npmjs.com/package/@types/node) | 22.19.19 | Node.js type definitions for scripts |
| [Node.js](https://nodejs.org/) | 22+ | Runtime for build, tests and scripts |
| [pnpm](https://pnpm.io/) | 11.25.0 | Package manager |

## Quality assurance (not shipped)

| Name | Version | Role |
| --- | --- | --- |
| [Playwright Core](https://playwright.dev/) | 1.56.1 | Drives the browser for `pnpm qa:browser` and `pnpm qa:stress` |
| [Google Chrome](https://www.google.com/chrome/) | 156 (headless) | Browser used for QA and screenshots |
| Node.js built-in test runner | — | Unit tests in `tests/` |

## AI agents and models

| Name | Role |
| --- | --- |
| OpenAI ChatGPT / Codex | Initial build of the prototype (earlier branches) |
| [Cursor](https://cursor.com/) Cloud Agent, running Anthropic Claude (Claude Opus) | Finishing passes and this redesign: fictional sample data, market pricing, UI modules, styling, accessibility, QA scripts, screenshots and documentation |

The owner (bayuewalker) directed and reviewed the work. No AI image or design-generation model was used; there are no generated images in the entry.

## Hosting

GitHub Pages, deployed from the `gh-pages` branch root. No custom GitHub Actions deployment.

## Assets and data

- **Brand pack:** `brand/logo.svg` (official Housebets wordmark) and `brand/mark.svg` (official mark, also copied to `public/favicon.svg`). The top bar, left rail and side panel use this logo and mark, the pack cyan (`#02F7FD`) and 8px radii.
- Interface icons, team badges (colour + three-letter code) and country flags are original inline SVG/CSS. No club, league or federation artwork is bundled.
- All fixtures, odds, scores, bets and chat messages are sample data. Every player name is fictional. Club and competition names are used only as sample labels.
