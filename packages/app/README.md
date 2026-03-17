# Open DJED — Frontend Application

This package contains the Open DJED web application (React + React Router) used to interact with the Open DJED protocol.

Below you'll find a short overview of the technologies used, how to install and run the app using Bun, and how to extract and manage translations.

## Technologies

- Framework: React
- Routing: Next.js
- Bundler / dev server: Turbopack
- Cloud runtime: Cloudflare Workers (wrangler)
- Internationalization: next-intl
- Translation extraction: i18next-parser
- Language files: JSON under `/messages/`

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

This runs the `next dev --turbopack` script defined in `packages/app/package.json` and starts the Turbopack-based dev server.

If you prefer to run from the repo root you can also execute:

```bash
bun run --filter @open-djed/app dev
```

## Type checking and Cloudflare typegen

To run the type generation and TypeScript build defined by the package:

```bash
cd packages/app
bun run typecheck
```

This runs Cloudflare type generation, React Router typegen, and TypeScript build checks.

## Translations (i18n)

This app uses `next-intl` for internationalization. Translation strings are extracted using `i18next-parser`.

### Extract strings (generate/update locale files)

From the app package directory run:

```bash
cd packages/app
bun run locales-extract
```

The `locales-extract` script uses `bunx i18next-parser` (configured by `i18next-parser.config.ts` in this package). Extraction scans the source files for translation keys and updates JSON files under `packages/app/messages/` (for example `messages/en/` and `messages/pt/`).

After running the extractor, review and update the generated translations as needed, then commit the locale files.

### Editing translations

- Locale files live in `packages/app/messages/<lang>/` as JSON files per namespace.
- Edit those JSON files directly.

## Local Storage

| Key | Purpose | Notes |
| --- | ------- | ----- |

## Cookies

| Key    | Purpose                            | Notes                                          |
| ------ | ---------------------------------- | ---------------------------------------------- |
| i18Lng | Caches user's language preference. | Set by `next-intl`'s cookie language detector. |
