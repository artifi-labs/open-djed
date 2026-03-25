---
sidebar_position: 1
title: Project Architecture
---

# Project Architecture

Open Djed is organized as a monorepo, containing multiple packages that together form the complete application stack. This modular approach makes it easier to develop, test, and maintain each component independently.

## Repository Structure

The monorepo is organized under `/packages`, where each package has a focused responsibility.

For local setup, all packages should follow their own `.env` and `.env.example` files.

### App (`packages/app`)

**Purpose:** Main frontend application (Next.js/React) used by end users.

**How to run:**

```sh
cd packages/app
bun install
bun dev
```

**Main responsibilities:**

- Connect Cardano wallets
- Mint and burn DJED/SHEN
- Support internationalization (i18n) with localized messages
- Show protocol analytics and charts
- Simulate SHEN yield
- Track and manage user orders

### API (`packages/api`)

**Purpose:** Backend API consumed by the frontend and other services.

**How to run:**

```sh
cd packages/api
bun install
bun dev
```

**Main responsibilities:**

- Expose endpoints used by the app
- Orchestrate business logic
- Aggregate blockchain and database data
- Serve cached/normalized data for faster reads

### DB (`packages/db`)

**Purpose:** Persistence and synchronization layer (Prisma + database) for protocol state, orders, and analytics.

**How to run:**

- Ensure the database is running (for local development, start services with Docker Compose)
- Configure database environment variables
- Apply migrations:
  ```sh
  cd packages/db
  bun install
  bun migrate
  ```
- Start the sync worker:
  ```sh
  cd packages/db
  bun install
  bun run dev
  ```

**Main responsibilities:**

- Run a recurring sync job (cron-like) on a fixed interval to fetch fresh blockchain data
- Continuously update DJED and SHEN order data in the database
- Persist and refresh stablecoin-related analytics used by the app/API
- Provide a queryable historical dataset for charts and monitoring

### CLI (`packages/cli`)

**Purpose:** Command-line interface for operational and developer workflows.

**How to run:**

```sh
cd packages/cli
bun install
bun start -- <command>
```

**Main responsibilities:**

- Query protocol/on-chain state
- Build and submit transactions
- Automate repetitive operations

### Data (`packages/data`)

**Purpose:** Shared types, decoders, and data utilities for on-chain structures.

**How to use:**

- Consumed as a dependency by other packages
- Centralizes parsing/validation logic to keep behavior consistent

### Blockfrost (`packages/blockfrost`)

**Purpose:** Internal client wrapper for Blockfrost integration.

**How to use:**

- Imported by API/DB/CLI flows that need Cardano data
- Encapsulates external API communication details

### Math (`packages/math`)

**Purpose:** Financial and protocol math utilities (rates, reserves, market-cap related calculations).

**How to use:**

- Imported by services that require deterministic numeric logic

### Registry (`packages/registry`)

**Purpose:** Token and asset registry helpers used across the stack.

**How to use:**

- Imported by packages that need consistent asset metadata/lookup behavior

### Txs (`packages/txs`)

**Purpose:** Transaction-building primitives and higher-level transaction helpers.

**How to use:**

- Imported where transaction assembly/signing flows are needed

### Docs (`packages/docs`)

**Purpose:** Project documentation site (Docusaurus).

**How to run:**

```sh
cd packages/docs
bun install
bun start
```

**Main responsibilities:**

- Host architecture, user guides, and contributor docs
- Keep technical knowledge discoverable and up to date

## Development Workflow

1. Install dependencies at the root of the monorepo:
   ```sh
   bun install
   ```
2. Run the full test suite from the project root:
   ```sh
   bun run test
   ```
3. Develop and test each package independently using local scripts.
4. Use the `/app` package to run the frontend and interact with the Djed protocol.
5. Refer to the `/docs` package for detailed documentation on architecture, APIs, and contributing.

---

This modular structure makes Open Djed easy to maintain, scale, and contribute to, allowing each component to evolve independently while remaining integrated.
