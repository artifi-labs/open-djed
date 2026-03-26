# Database

`@open-djed/db` is the data layer package for Open DJED.

It manages PostgreSQL schema/migrations and keeps protocol data synchronized from chain data providers so other packages (like API) can query historical and analytics data.

## What This Package Does

- Manages Prisma schema, migrations, and generated client.
- Stores and serves protocol historical data.
- Syncs orders and analytics data to the database.
- Exposes typed query helpers used by other packages.

## What It Supports

- Orders history lookups.
- Historical reserve ratio.
- Historical market cap.
- Historical prices.
- Historical volumes.
- Historical staking rewards.
- Fees and earnings data access.

## Installation

From the repository root:

```bash
bun install
```

## Setup

### 1. Configure environments

Copy and configure DB env file:

```bash
cp packages/db/.env.example packages/db/.env
```

If you use Docker Compose from root, also configure root env:

```bash
cp .env.example .env
```

### 2. Start PostgreSQL (Docker Compose)

From repository root:

```bash
docker compose up -d
```

### 3. Apply migrations

From `packages/db`:

```bash
bun run migrate
```

## Sync Data

Run one sync execution:

```bash
bun run sync
```

Run continuous sync in watch mode:

```bash
bun run dev
```

## External Dependencies

- PostgreSQL (local via Docker Compose or external instance).
- Blockfrost API (`BLOCKFROST_URL` and `BLOCKFROST_PROJECT_ID`).
- Prisma (migrations + generated client).

## Notes

- This package is consumed by `@open-djed/api` for analytics and historical endpoints.
- Cron schedule and batch behavior can be tuned through env/config values in the package runtime.
