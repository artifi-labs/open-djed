# @open-djed/blockfrost

A fully-typed Blockfrost API client for Cardano with built-in Zod schema validation, automatic pagination, and configurable retry logic.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Networks](#networks)
- [Services](#services)
  - [Blocks](#blocks)
  - [Addresses](#addresses)
  - [Transactions](#transactions)
- [Pagination](#pagination)
- [Retry](#retry)
- [Error Handling](#error-handling)
- [Types](#types)
- [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)

---

## Quick Start

```typescript
import { BlockfrostClient, Network } from "@open-djed/blockfrost"

const client = new BlockfrostClient("your-api-key", Network.MAINNET)

// fetch the latest block
const block = await client.blocks.getLatest()

// fetch all transactions for an address
const txs = await client.addresses.getAddressTransactions("addr1...").allPages()
```

---

## Configuration

```typescript
new BlockfrostClient(apiKey, network, retryOptions?)
```

| Parameter      | Type           | Required | Default | Description                |
| -------------- | -------------- | -------- | ------- | -------------------------- |
| `apiKey`       | `string`       | Y        | —       | Your Blockfrost project ID |
| `network`      | `Network`      | Y        | —       | Target Cardano network     |
| `retryOptions` | `RetryOptions` | N        | `{}`    | Global retry configuration |

### RetryOptions

| Option     | Type                       | Default     | Description                          |
| ---------- | -------------------------- | ----------- | ------------------------------------ |
| `attempts` | `number`                   | `1`         | Total number of attempts per request |
| `timeout`  | `number`                   | `10000`     | Timeout per attempt in milliseconds  |
| `onRetry`  | `(error, attempt) => void` | `undefined` | Callback invoked between retries     |

```typescript
const client = new BlockfrostClient("your-api-key", Network.MAINNET, {
  attempts: 3,
  timeout: 10_000,
  onRetry: (error, attempt) => console.warn(`Retry ${attempt}`, error),
})
```

---

## Networks

| Constant          | URL                                            | Description             |
| ----------------- | ---------------------------------------------- | ----------------------- |
| `Network.MAINNET` | `https://cardano-mainnet.blockfrost.io/api/v0` | Cardano Mainnet         |
| `Network.PREPROD` | `https://cardano-preprod.blockfrost.io/api/v0` | Cardano Preprod Testnet |
| `Network.PREVIEW` | `https://cardano-preview.blockfrost.io/api/v0` | Cardano Preview Testnet |

---

## Services

### Blocks

#### `client.blocks.getLatest()`

Returns the latest block on the chain.

```typescript
const block = await client.blocks.getLatest()
```

**Returns:** `Promise<LatestBlock>`

| Field           | Type     | Description                |
| --------------- | -------- | -------------------------- |
| `hash`          | `string` | Block hash                 |
| `height`        | `number` | Block height               |
| `slot`          | `number` | Slot number                |
| `epoch`         | `number` | Epoch number               |
| `epoch_slot`    | `number` | Slot within the epoch      |
| `tx_count`      | `number` | Number of transactions     |
| `size`          | `number` | Block size in bytes        |
| `time`          | `number` | Block creation time (UNIX) |
| `output`        | `string` | Total output in Lovelace   |
| `fees`          | `string` | Total fees in Lovelace     |
| `confirmations` | `number` | Number of confirmations    |

---

### Addresses

#### `client.addresses.getAddressTransactions()`

Returns transactions for a given address. Supports pagination.

```typescript
// first page (default)
const txs = await client.addresses.getAddressTransactions("addr1...")

// all pages
const txs = await client.addresses.getAddressTransactions("addr1...").allPages()
```

**Parameters:**

| Parameter | Type                       | Required | Description    |
| --------- | -------------------------- | -------- | -------------- |
| `address` | `string`                   | Y        | Bech32 address |
| `query`   | `AddressTransactionsQuery` | N        | Query options  |

**Query options:**

| Option  | Type              | Default | Description                |
| ------- | ----------------- | ------- | -------------------------- |
| `count` | `number`          | `100`   | Results per page (max 100) |
| `page`  | `number`          | `1`     | Page number                |
| `order` | `"asc" \| "desc"` | `"asc"` | Result ordering            |
| `from`  | `string`          | —       | Start block                |
| `to`    | `string`          | —       | End block                  |

**Returns:** `PaginatedRequest<AddressTransaction>`

| Field          | Type     | Description       |
| -------------- | -------- | ----------------- |
| `tx_hash`      | `string` | Transaction hash  |
| `tx_index`     | `number` | Transaction index |
| `block_height` | `number` | Block height      |
| `block_time`   | `number` | Block time (UNIX) |

---

### Transactions

#### `client.transactions.getTransactionUtxos()`

Returns the UTXOs of a specific transaction.

```typescript
const utxos = await client.transactions.getTransactionUtxos("1e043f...")
```

**Parameters:**

| Parameter | Type     | Required | Description      |
| --------- | -------- | -------- | ---------------- |
| `txHash`  | `string` | Y        | Transaction hash |

**Returns:** `Promise<TransactionUtxo>`

| Field     | Type                      | Description      |
| --------- | ------------------------- | ---------------- |
| `hash`    | `string`                  | Transaction hash |
| `inputs`  | `TransactionUtxoInput[]`  | List of inputs   |
| `outputs` | `TransactionUtxoOutput[]` | List of outputs  |

---

## Pagination

All endpoints that return lists support pagination via `PaginatedRequest`. You can use it with or without `.allPages()`.

```typescript
// first page only — no .allPages() needed
const txs = await client.addresses.getAddressTransactions("addr1...")

// all pages
const txs = await client.addresses.getAddressTransactions("addr1...").allPages()
```

### PaginationOptions

| Option      | Type                | Default    | Description                                           |
| ----------- | ------------------- | ---------- | ----------------------------------------------------- |
| `count`     | `number`            | `100`      | Items per page                                        |
| `maxPages`  | `number`            | `Infinity` | Maximum number of pages to fetch                      |
| `filter`    | `(item) => boolean` | —          | Keep only items that match                            |
| `stopWhen`  | `(item) => boolean` | —          | Stop pagination **before** including the matched item |
| `stopAfter` | `(item) => boolean` | —          | Stop pagination **after** including the matched item  |

### Examples

```typescript
const yesterday = Date.now() / 1000 - 86_400

// fetch at most 5 pages
await client.addresses
  .getAddressTransactions("addr1...")
  .allPages({ maxPages: 5 })

// only keep transactions from the last 24h
await client.addresses.getAddressTransactions("addr1...").allPages({
  filter: (tx) => tx.block_time > yesterday,
})

// stop before the first old transaction (excluded)
await client.addresses.getAddressTransactions("addr1...").allPages({
  stopWhen: (tx) => tx.block_time < yesterday,
})

// stop after a specific transaction (included)
await client.addresses.getAddressTransactions("addr1...").allPages({
  stopAfter: (tx) => tx.tx_hash === "abc123...",
})

// combine filter and stop
await client.addresses
  .getAddressTransactions("addr1...", { order: "desc" })
  .allPages({
    filter: (tx) => tx.block_time > yesterday,
    stopWhen: (tx) => tx.block_time < yesterday,
  })
```

---

## Retry

Retry can be configured globally in the constructor or overridden per request using `.retry()`.

```typescript
// global — applies to all requests
const client = new BlockfrostClient("api-key", Network.MAINNET, {
  attempts: 3,
  timeout: 10_000,
})

// per request — overrides the global config
await client.blocks.getLatest().retry({ attempts: 1, timeout: 2_000 })

// pagination with retry per page
await client.addresses
  .getAddressTransactions("addr1...")
  .retry({ attempts: 3 })
  .allPages()
```

### Retry Behaviour

| Status | Retries | Description                                |
| ------ | ------- | ------------------------------------------ |
| `500`  | N       | Internal server error — thrown immediately |

---

## Error Handling

All API errors throw a `BlockfrostError` with the following properties:

| Property  | Type     | Description      |
| --------- | -------- | ---------------- |
| `status`  | `number` | HTTP status code |
| `error`   | `string` | Error type       |
| `message` | `string` | Error message    |
| `path`    | `string` | Request path     |

```typescript
import { BlockfrostError } from "@open-djed/blockfrost"

try {
  const block = await client.blocks.getLatest()
} catch (error) {
  if (error instanceof BlockfrostError) {
    console.error(`${error.status} — ${error.message}`)
  }
}
```

---

## Types

All types are exported from the root of the package:

```typescript
import type {
  // responses
  LatestBlock,
  AddressTransaction,
  AddressTransactionsQuery,
  TransactionUtxo,
  TransactionUtxoInput,
  TransactionUtxoOutput,
  // config
  RetryOptions,
  PaginationOptions,
  Network,
} from "@open-djed/blockfrost"
```

---

## Environment Setup

```typescript
import { BlockfrostClient, Network } from "@open-djed/blockfrost"

const networkMap: Record<"Mainnet" | "Preprod", Network> = {
  Mainnet: Network.MAINNET,
  Preprod: Network.PREPROD,
}

const client = new BlockfrostClient(
  env.BLOCKFROST_PROJECT_ID,
  networkMap[env.NETWORK],
)
```

---

## Running Tests

```bash
bun run test
```

---
