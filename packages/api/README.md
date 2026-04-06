# API

Package holding the Open DJED web API.

This service is used by the web app for operations that require server-side access to chain data and external providers (for example, Blockfrost), plus historical analytics data from the database.

## What this package provides

- On-chain protocol data endpoints (pool/oracle/order context).
- Transaction building endpoints (mint, burn, cancel order).
- Historical analytics endpoints (market cap, volume, reserve ratio, prices, rewards).
- OpenAPI + Scalar documentation endpoints.

## Tech stack

- Runtime/server: Bun + Hono
- Validation and API docs: zod + hono-openapi + zod-openapi
- Chain integration: @lucid-evolution/lucid + @open-djed/blockfrost
- Data layer: @open-djed/db

## Prerequisites

- Bun installed
- A configured Blockfrost project (URL + API key)
- Local database running when using historical endpoints

## Configuration

Create a `.env` file in `packages/api` based on `.env.example`.

Required variables:

- `NETWORK` (`Mainnet` or `Preprod`)
- `PORT` (defaults to `8080` if not set)
- `BLOCKFROST_URL`
- `BLOCKFROST_PROJECT_ID`
- `DATABASE_URL` (required by analytics/history queries)

## Run locally

From `packages/api`:

```bash
bun run dev
```

Alternative start command:

```bash
bun run start
```

From repo root:

```bash
bun run --filter @open-djed/api dev
```

After startup, the server runs on `http://localhost:<PORT>`.

## API documentation

- OpenAPI JSON: `GET /api/doc`
- Scalar UI: `GET /api/scalar`

## External Dependencies

- Blockfrost API.
- PostgreSQL database.

## Notes

- The service includes in-memory short-lived caching for selected endpoints.
- Request/response validation is handled with Zod schemas.
