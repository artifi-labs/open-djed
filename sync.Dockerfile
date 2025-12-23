FROM oven/bun:1 as builder
WORKDIR /usr/src/app

RUN apt update && apt install -y git && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock tsconfig.json ./

COPY packages/db/ ./packages/db/

COPY packages/api ./packages/api
COPY packages/data ./packages/data
COPY packages/txs ./packages/txs
COPY packages/math ./packages/math
COPY packages/blockfrost/ ./packages/blockfrost/
COPY packages/registry/ ./packages/registry/

COPY packages/app/package.json ./packages/app/
COPY packages/cli/package.json ./packages/cli/

RUN bun i --frozen-lockfile

WORKDIR /usr/src/app/packages/db

ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN bun run generate

FROM oven/bun:1

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

WORKDIR /usr/src/app/packages/db

ENTRYPOINT ["bun", "run", "sync"]
