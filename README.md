<div align="center">

![Open DJED](./packages/docs/static/logos/opendjed-logo-white.svg)

**Open DJED** - A transparent, community-driven interface for the DJED stablecoin protocol.

[Documentation](https://docs.djed.artifi.finance)

</div>

---

## What is Open DJED?

**Open DJED** is a transparent, community-driven web application for interacting with the DJED algorithmic stablecoin protocol on **Cardano**—built without the barriers of proprietary code.

Developed by **Artifi Labs**, Open DJED is the result of a deep reverse-engineering effort of the original DJED application. We've recreated the user interface and interaction logic while maintaining full protocol compatibility—then made everything open source for the entire Cardano ecosystem to explore, audit, and improve.

## Why Open DJED?

- **Protocol-compatible** – Same overcollateralized logic that powers DJED.
- **Fully open source** – All code is auditable, forkable, and community-owned.
- **Community-first** – Built for and by the Cardano community.
- **Enhanced reliability** – Alternative access during COTI app downtime or issues.
- **Global accessibility** – Available to users worldwide without geographic restrictions.
- **Transparent fees** – Follows COTI's fee structure transparently, no surcharges.
- **Lower network fees** – Optimized contracts reduce fees by ~0.1 ADA.

## Our Mission

We built Open DJED to address critical accessibility challenges with the original COTI DJED application. Recurring downtime, system issues, and geographic restrictions created barriers for legitimate users seeking to interact with the DJED protocol. Open DJED provides an alternative interface that eliminates these obstacles while maintaining full protocol compatibility.

**Artifi Labs** builds open-source, permissionless tools for the Cardano ecosystem. Open DJED is our first major release—and we're only just getting started!

Join us in reshaping DeFi on Cardano—openly, transparently, and together.

## Getting Started

### Prerequisites

- **Bun** — Fast JavaScript runtime and package manager ([install](https://bun.sh))
- **Docker** and **Docker Compose** — For running PostgreSQL locally

### Installation

Clone the repository:

```bash
git clone https://github.com/artifi-labs/open-djed
cd open-djed
```

Install dependencies using Bun:

```bash
bun install
```

### Environment Setup

Create `.env` files for each package based on the provided examples.

**[Env File](.env.example)** — Root environment for Docker Compose (PostgreSQL)

```bash
cp .env.example .env
```

**[Env File](packages/app/.env.example)** — Web app configuration

```bash
cp packages/app/.env.example packages/app/.env
```

**[Env File](packages/api/.env.example)** — API server configuration

```bash
cp packages/api/.env.example packages/api/.env
```

**[Env File](packages/db/.env.example)** — Database configuration

```bash
cp packages/db/.env.example packages/db/.env
```

**[Env File](packages/docs/.env.example)** — Documentation (optional)

```bash
cp packages/docs/.env.example packages/docs/.env
```

### Database Setup

Start the PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

This uses variables from the root `.env` (copied from `.env.example`) and starts PostgreSQL on `localhost:5432`.

Run database migrations:

```bash
cd packages/db
bun run migrate
```

Check the [Database README](packages/db/README.md) for more details on setup and syncing data.

### Running Packages

**Web App** (React/Next.js):

```bash
bun run --filter @open-djed/app dev
```

**API Server** (Hono):

```bash
bun run --filter @open-djed/api dev
```

**Documentation** (Docusaurus):

```bash
bun run --filter @open-djed/docs start
```

### Running Tests

Run all tests using vitest from the repo root:

```bash
bun run test
```

### More Information

- [API Readme](packages/api/README.md)
- [Web App Readme](packages/app/README.md)
- [Blockfrost Readme](packages/blockfrost/README.md)
- [CLI Readme](packages/cli/README.md)
- [Data Readme](packages/data/README.md)
- [Database Readme](packages/db/README.md)
- [Documentation Readme](packages/docs/README.md)
- [Math Readme](packages/math/README.md)
- [Transactions Readme](packages/txs/README.md)
