# Database - local development

### Create database

First, start docker container in root:

```bash
docker compose up -d
```

Deploy the current migrations:

```bash
bun migrate deploy
```

To make a new migration:

```bash
bun migrate
```

To generate the client:

```bash
bun generate
```

### Populate the database with historical data

To populate the database with every order of the protocol, run:

```bash
bun src/populateDb.ts
```

### Keep the database updated

In order to keep the database updated (synced with the latest block), run:

```bash
bun scr/cron.js
```

This will launch a local cron job that will run a script every 30 seconds.
This script will lookup the newly created blocks, since the latest sync, and will check if any new orders were created. It also updates any pending order, updating its status.
