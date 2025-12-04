# db

First, start docker container in root:

```bash
docker compose up -d
```

To initialize Prisma:

```bash
bunx prisma init --datasource-provider postgresql
```

To make a new migration:

```bash
bun migrate
```

or:

```bash
bunx prisma migrate dev --name <migration_name>
```

To generate the client:

```bash
bun generate
```
