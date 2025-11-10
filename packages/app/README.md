# Open DJED — Frontend Application

This package contains the Open DJED web application (React + React Router) used to interact with the Open DJED protocol.

Below you'll find a short overview of the technologies used, how to install and run the app using Bun, and how to extract and manage translations.

## Technologies

- Framework: React
- Routing: React Router
- Bundler / dev server: Vite
- Cloud runtime: Cloudflare Workers (wrangler)
- Internationalization: i18next + react-i18next
- Translation extraction: i18next-parser
- Language files: JSON under `/locales/`

## Prerequisites

- [Bun](https://bun.sh) — used to install dependencies and run scripts in this repo. Or other Node.js package managers like npm or yarn, but Bun is recommended for best performance.

## Install (using Bun)

From the repo root (where the top-level `package.json` lives), run:

```bash
bun install
```

This will install dependencies for the workspace packages (including `packages/app`).

## Running the app in development

Change into the app package and run the dev script:

```bash
cd packages/app
bun run dev
```

This runs the `react-router dev` script defined in `packages/app/package.json` and starts the Vite-based dev server.

If you prefer to run from the repo root you can also execute the same script via Bun's workspace script runner:

```bash
bun -w run --filter @open-djed/app dev
```

## Type checking and Cloudflare typegen

To run the type generation and TypeScript build defined by the package:

```bash
cd packages/app
bun run typecheck
```

This runs Cloudflare type generation, React Router typegen, and TypeScript build checks.

## Translations (i18n)

This app uses `i18next` and `react-i18next` for internationalization. Translation strings are extracted using `i18next-parser`.

### Extract strings (generate/update locale files)

From the app package directory run:

```bash
cd packages/app
bun run i18n:extract
```

The `i18n:extract` script uses `bunx i18next-parser` (configured by `i18next-parser.config.js` in this package). Extraction scans the source files for translation keys and updates JSON files under `packages/app/locales/` (for example `locales/en/` and `locales/pt/`).

After running the extractor, review and update the generated translations as needed, then commit the locale files.

### Editing translations

- Locale files live in `packages/app/locales/<lang>/` as JSON files per namespace.
- Edit those JSON files directly and restart the dev server if necessary. `react-i18next` will pick up JSON changes on reload.

## TODO

- [ ] Deploy Mainnet test app per PR.
- [ ] Add translations to the app.
- [ ] Show user's pending orders.
- [ ] Allow cancelling orders.
- [ ] Support ADA amount inputs, alongside the DJED/SHEN amount inputs (requested by Dan).
- [ ] Add ADA and USD amounts for all fields on the app (primary display in big letters, secondary display in small letters f.e.).
- [ ] Improve aesthetic of app.
  - [ ] Missing eye candy.
  - [ ] Use better font.
- [ ] Add reserve ratio graphic.
- [ ] Improve mobile responsiveness.
- [ ] Fix small underestimation in "You will receive" field.
- [ ] Fix underestimation in "Available" field.
- [ ] Support minting both, burning both actions.
- [ ] Cover all error/edge-cases and give user good information.
- [ ] Apply correct `ErrorBoundary` usage in React Router.
- [ ] Build custom 404 page.
- [ ] Add first load modal informing user of what Open DJED is and how it relates to COTI's DJED app.
- [ ] Add "What's new?" modal informing users of what we've added since they last visited the app.
- [ ] Add API and app version to footer of app.
- [ ] Add tooltips to home page.
