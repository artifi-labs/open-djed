import type { Actions, Token } from "../../generated/prisma/enums"
import { env } from "../../lib/env"
import { Blockfrost } from "@open-djed/blockfrost"
import { registryByNetwork } from "@open-djed/registry"
import {
  credentialToAddress,
  Data,
  getAddressDetails,
} from "@lucid-evolution/lucid"
import {
  OrderStatus,
  RedeemerPurpose,
  type AddressDatum,
  type Order,
  type OrderUTxOWithDatum,
  type OrderUTxOWithDatumAndBlock,
  type TransactionRedeemer,
  type UTxO,
  type Transaction,
  type OracleUTxoWithDatumAndTimestamp,
  type PoolUTxoWithDatumAndTimestamp,
  type DailyUTxOs,
  type OrderedPoolOracleTxOs,
  type TransactionData,
  type Period,
} from "./types"

import fs from "fs"
import path from "path"
import { logger } from "../utils/logger"
import {
  CancelOrderSpendRedeemerHash,
  OracleDatum,
  PoolDatum,
  ProcessOrderSpendOrderRedeemerHash,
  type OrderDatum,
} from "@open-djed/data"
import JSONbig from "json-bigint"
import fsPromises from "fs/promises"

const blockfrostUrl = env.BLOCKFROST_URL
const blockfrostId = env.BLOCKFROST_PROJECT_ID
export const blockfrost = new Blockfrost(blockfrostUrl, blockfrostId)
export const network = env.NETWORK
export const registry = registryByNetwork[network]

export const SAFETY_MARGIN = 50 // updates database 50 slots behind the tip of the blockchain

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export function blockfrostFetch(path: string, init?: RequestInit) {
  return fetchWithRetry(`${blockfrostUrl}${path}`, {
    ...init,
    headers: {
      project_id: blockfrostId,
      ...init?.headers,
    },
  })
}

/**
 * fetch from API and retry if it fails
 * @param url API endpoint
 * @param options request options
 * @param retries how many retries
 * @param delayMs milliseconds to delay before next
 * @returns
 */
export async function fetchWithRetry<T = unknown>(
  url: string,
  options: RequestInit,
  retries: number = 5,
  delayMs: number = 10_000,
): Promise<T> {
  let lastError: Error | undefined
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        if (response.status === 429) {
          // rate limited
          const delay = delayMs * 2 ** i
          logger.warn(`Rate limited, waiting ${delay}ms...`)
          await sleep(delay)
          continue
        }
        console.log("URL: ", url)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text || text.trim().length === 0) {
        throw new Error("Empty response")
      }
      return JSON.parse(text) as T
    } catch (error) {
      lastError = error as Error
      if (i === retries - 1) break
      const delay = delayMs * 2 ** i
      logger.error(error, `Attempt ${i + 1} failed, retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }
  throw new Error(
    `All retry attempts failed. Last error: ${lastError?.message}`,
  )
}

/**
 * from an array, create a batch to proccess concurrently
 * bigger batch = faster, but riskier bc of rate limit
 * define wait period between batch processing
 * @param items array of items to process
 * @param processor function that processes the items
 * @param batchSize size of the batches to be processed at a time
 * @param delayMs milliseconds to delay before next
 * @returns
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  batchSize: number = 10,
  delayMs: number = 10_000,
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((item, idx) => processor(item, i + idx)),
    )
    results.push(...batchResults)

    if (delayMs > 0 && i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * parses an Order datum and returns normalized values
 * Mint action has all the values we need in the datum
 * Burn action requires us to look into the consuming transaction UTxOs,
 *  to find the UTxO sent to the user's address, with the payment value
 * @param d a decoded Order datum
 * @returns
 */
export async function parseOrderDatum(orderUTxO: OrderUTxOWithDatumAndBlock) {
  const d = orderUTxO.orderDatum
  const entries = Object.entries(d.actionFields)

  if (entries.length === 0) {
    throw new Error("OrderDatum has no actionFields")
  }

  const firstEntry = entries[0]
  if (!firstEntry) {
    throw new Error("OrderDatum has no actionFields")
  }

  const [actionName, values] = firstEntry

  const action: Actions = actionName.startsWith("Mint") ? "Mint" : "Burn"

  let token: Token
  if (actionName.includes("SHEN")) token = "SHEN"
  else if (actionName.includes("DJED")) token = "DJED"
  else token = "BOTH"

  let paid: bigint = 0n
  let received: bigint = 0n

  if (action === "Mint") {
    paid = values.adaAmount ?? 0n

    if ("shenAmount" in values && typeof values.shenAmount === "bigint") {
      received += values.shenAmount
    }
    if ("djedAmount" in values && typeof values.djedAmount === "bigint") {
      received += values.djedAmount
    }
  } else {
    if ("shenAmount" in values && typeof values.shenAmount === "bigint") {
      paid += values.shenAmount
    }
    if ("djedAmount" in values && typeof values.djedAmount === "bigint") {
      paid += values.djedAmount
    }

    if (typeof orderUTxO.consumed_by_tx !== "string")
      return { action, token, paid, received: undefined }

    const addr = d.address as AddressDatum
    received = await getBurnReceivedValue(addr, orderUTxO.consumed_by_tx)
  }

  return {
    action,
    token,
    paid,
    received,
  }
}

export function constructAddress(
  paymentKeyHash: string,
  stakeKeyHash: string,
  network: "Mainnet" | "Preprod" | "Preview",
): string {
  return credentialToAddress(
    network,
    { type: "Key", hash: paymentKeyHash },
    { type: "Key", hash: stakeKeyHash },
  )
}

const lockDir = path.join(process.cwd(), ".cron-lock")
const lockFile = path.join(lockDir, "lock")

export const isLocked = () => {
  return fs.existsSync(lockFile)
}

export const lock = () => {
  if (!fs.existsSync(lockDir)) {
    fs.mkdirSync(lockDir)
  }
  fs.writeFileSync(lockFile, "")
}

export const unlock = () => {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile)
  }
}

/**
 * process the order UTxOs to the suitable Order type to insert in the database
 * @param utxos array of Order UTxOs, with decoded datum
 * @returns array of Order objects to be inserted in the database
 */
export async function processOrdersToInsert(utxos: OrderUTxOWithDatum[]) {
  return Promise.all(
    utxos.map(async (utxo) => {
      const d = utxo.orderDatum as OrderDatum
      const { action, token, paid, received } = await parseOrderDatum(utxo)
      const totalAmountPaid = BigInt(
        utxo.amount.find((a) => a.unit === "lovelace")?.quantity ?? "0",
      )
      const fees = action === "Mint" ? totalAmountPaid - paid : totalAmountPaid
      const status = await handleOrderStatus(
        utxo.consumed_by_tx,
        utxo.tx_hash,
        utxo.output_index,
      )

      return {
        address: d.address,
        tx_hash: utxo.tx_hash,
        out_index: utxo.output_index,
        block: utxo.block_hash,
        slot: utxo.block_slot,
        action,
        token,
        paid,
        fees,
        received,
        orderDate: new Date(Number(d.creationDate)),
        status: status,
      } as unknown as Order
    }),
  )
}

/**
 * Check the status of an order based on its consuming transaction.
 * Map the inputs of the consuming transaction, in search of the matching order UTxO coming from the script.
 * Get the index of the matching input and proceed to get the transaction redeemers (we only need those with purpose 'spend').
 * Match the input to the redeemer by the index and match the redeemer_data_hash to the known redeemers for 'ProcessOrderSpendOrderHash' and 'CancelOrderSpendHash'.
 * If found, return the corresponding status.
 * @param consumedBy the tx hash of the consuming transaction
 * @param orderTxHash the tx hash of the order transaction
 * @param orderOutIndex the output_index of order UTxO
 * @returns the status of the order
 */
export async function handleOrderStatus(
  consumedBy: string | undefined | null,
  orderTxHash: string,
  orderOutIndex: number,
): Promise<OrderStatus> {
  if (!consumedBy) {
    return OrderStatus.Created
  }

  // get inputs of the consuming transaction
  const consumingTx = (await blockfrostFetch(
    `/txs/${consumedBy}/utxos`,
  )) as UTxO
  const consumingTxInputs = consumingTx.inputs
  if (consumingTxInputs.length === 0) {
    return OrderStatus.Created
  }

  // get spendable inputs
  const spendableInputs = consumingTxInputs.filter(
    (input) => !input.reference && !input.collateral,
  )
  if (spendableInputs.length === 0) {
    return OrderStatus.Created
  }

  // get the inputs that match the order UTxO
  const matchingInputIndex = spendableInputs.findIndex((input) => {
    const isScriptAddress =
      getAddressDetails(input.address).paymentCredential?.type === "Script"
    return (
      isScriptAddress &&
      input.tx_hash === orderTxHash &&
      input.output_index === orderOutIndex
    )
  })
  if (matchingInputIndex === -1) {
    return OrderStatus.Created
  }

  // get the redeemers of the consuming transaction
  const redeemersData = (await blockfrostFetch(
    `/txs/${consumedBy}/redeemers`,
  )) as TransactionRedeemer[]
  if (redeemersData.length === 0) {
    return OrderStatus.Created
  }

  const spendRedeemers = redeemersData.filter(
    (redeemer) => redeemer.purpose === RedeemerPurpose.Spend,
  )
  const matchingRedeemer = spendRedeemers.find((redeemer) => {
    return redeemer.tx_index === matchingInputIndex
  })

  if (!matchingRedeemer) {
    return OrderStatus.Created
  }

  return matchingRedeemer.redeemer_data_hash === CancelOrderSpendRedeemerHash
    ? OrderStatus.Cancelled
    : matchingRedeemer.redeemer_data_hash === ProcessOrderSpendOrderRedeemerHash
      ? OrderStatus.Completed
      : OrderStatus.Created
}

/**
 * Gets the value received by the user after a burn order is successful
 * @param address the user address
 * @param consumingTx the tx hash of the consuming transaction
 * @returns the value received
 */
export async function getBurnReceivedValue(
  address: AddressDatum,
  consumingTx: string | null,
): Promise<bigint> {
  if (!consumingTx) {
    throw new Error(`No consuming tx`)
  }

  const paymentKeyHash = address.paymentKeyHash[0]
  const stakeKeyHash = address.stakeKeyHash[0]?.[0]?.[0]
  if (!paymentKeyHash || !stakeKeyHash) {
    throw new Error(`Invalid address structure`)
  }
  const userAddr = constructAddress(paymentKeyHash, stakeKeyHash, network)
  const utxosOfConsumingTx = (await blockfrostFetch(
    `/txs/${consumingTx}/utxos`,
  )) as UTxO
  const outputUTxOToUserAddr = utxosOfConsumingTx.outputs.find(
    (utxo) => utxo.address === userAddr,
  )
  if (!outputUTxOToUserAddr) {
    throw new Error(
      "Could not find output UTxO to user address in consuming transaction",
    )
  }
  const received = BigInt(
    outputUTxOToUserAddr.amount.find((a) => a.unit === "lovelace")?.quantity ??
      "0",
  )
  return received
}

/**
 * Runs a `while (true)` pagination loop against Blockfrost, concatenating every
 * transaction returned by each page. The loop stops when an empty page is encountered
 * @param endpoint the paginated Blockfrost endpoint to call (e.g. `/assets/.../transactions`)
 * @returns every transaction returned across the fetched pages
 */
export async function getEveryResultFromPaginatedEndpoint<T>(
  endpoint: string,
): Promise<T[]> {
  logger.info("Fetching all results...")
  const everyOrderTx: T[] = []
  let txPage = 1
  while (true) {
    try {
      logger.debug(`Fetching page ${txPage}...`)
      const pageResult = (await blockfrostFetch(
        `${endpoint}?page=${txPage}&count=100&order=desc`,
      )) as T[]

      if (!Array.isArray(pageResult) || pageResult.length === 0) break

      everyOrderTx.push(...pageResult)
      txPage++
    } catch (error) {
      logger.error(error, `Error fetching page ${txPage}:`)
      break
    }
  }
  return everyOrderTx
}

/**
 * Runs a `while (true)` pagination loop against Blockfrost, concatenating every
 * transaction returned by each page. The loop stops when an empty page is encountered
 * or when a transaction older than the specified time is encountered
 *
 * @param assetId
 * @param time
 * @returns
 */
export async function getAssetTxsUpUntilSpecifiedTime(
  assetId: string,
  time: string,
) {
  const specifiedTime = Math.floor(new Date(time).getTime() / 1000)
  logger.info(
    `Fetching transactions newer than ${time} (Unix: ${specifiedTime})...`,
  )
  const everyOrderTx: Transaction[] = []
  let txPage = 1
  while (true) {
    try {
      logger.debug(`Fetching transaction page ${txPage}...`)
      const pageResult = (await blockfrostFetch(
        `/assets/${assetId}/transactions?page=${txPage}&count=100&order=desc`,
      )) as Transaction[]

      if (!Array.isArray(pageResult) || pageResult.length === 0) break

      const validTxs = pageResult.filter((tx) => tx.block_time >= specifiedTime)

      everyOrderTx.push(...validTxs)

      if (validTxs.length < pageResult.length) {
        break
      }

      txPage++
    } catch (error) {
      logger.error(error, `Error fetching page ${txPage}:`)
      break
    }
  }
  return everyOrderTx
}

const getUtcDayKey = (timestamp: string) => timestamp.slice(0, 10)
const formatDayIso = (day: string) => `${day}T00:00:00.000Z`
const formatDayEndIso = (day: string) => `${day}T23:59:59.999Z`
export const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Aggregates reserve entries by their timestamp, sorts each bucket, and
 * annotates each day with ISO start/end bounds so the subsequent weighting
 * logic can reason about time spans.
 * @param entries the list of reserve entries generated from pool/oracle UTxOs
 * @returns per-day buckets with start/end ISO timestamps and sorted entries
 */
export const breakIntoDays = (
  entries: OrderedPoolOracleTxOs[],
): DailyUTxOs[] => {
  const buckets = new Map<string, OrderedPoolOracleTxOs[]>()
  for (const entry of entries) {
    const day = getUtcDayKey(entry.value.timestamp)
    let dayEntries = buckets.get(day)
    if (!dayEntries) {
      dayEntries = []
      buckets.set(day, dayEntries)
    }
    dayEntries.push(entry)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayEntries]) => ({
      day,
      startIso: formatDayIso(day),
      endIso: formatDayEndIso(day),
      entries: dayEntries.sort((a, b) =>
        a.value.timestamp.localeCompare(b.value.timestamp),
      ),
    }))
}

const withBlockTime = (
  txs: { tx_hash: string; block_time: number }[],
  utxos: UTxO[],
  assetId: string,
) => {
  const txTimeByHash = new Map(
    txs.map((tx) => [tx.tx_hash, tx.block_time] as const),
  )

  return utxos.flatMap((utxo) => {
    const blockTime = txTimeByHash.get(utxo.hash)
    if (blockTime === undefined) return []

    return utxo.outputs
      .filter((output) => output.data_hash !== null)
      .filter((output) => output.amount.some((amt) => amt.unit === assetId))
      .map((output) => ({
        ...output,
        tx_hash: utxo.hash,
        blockTime,
      }))
  })
}

export async function processPoolOracleTxs(
  everyPoolTx: Transaction[],
  everyOracleTx: Transaction[],
) {
  if (everyPoolTx.length === 0) {
    logger.info("No transactions found")
    return
  }
  logger.info(`Found ${everyPoolTx.length} transactions`)

  logger.info("Fetching UTxOs...")
  const everyPoolUTxO: UTxO[] = await processBatch(
    everyPoolTx,
    async (order) => {
      try {
        return (await blockfrostFetch(`/txs/${order.tx_hash}/utxos`)) as UTxO
      } catch (error) {
        logger.error(error, `Error fetching UTxO for tx ${order.tx_hash}:`)
        throw error
      }
    },
    10,
    500,
  )

  if (everyOracleTx.length === 0) {
    logger.info("No transactions found")
    return
  }
  logger.info(`Found ${everyOracleTx.length} transactions`)

  logger.info("Fetching UTxOs...")
  const everyOracleUTxO: UTxO[] = await processBatch(
    everyOracleTx,
    async (order) => {
      try {
        return (await blockfrostFetch(`/txs/${order.tx_hash}/utxos`)) as UTxO
      } catch (error) {
        logger.error(error, `Error fetching UTxO for tx ${order.tx_hash}:`)
        throw error
      }
    },
    10,
    500,
  )

  const poolUTxOsWithTimestamp = withBlockTime(
    everyPoolTx,
    everyPoolUTxO,
    registry.poolAssetId,
  )
  const oracleUTXOsWithTimestamp = withBlockTime(
    everyOracleTx,
    everyOracleUTxO,
    registry.oracleAssetId,
  )

  logger.info("Fetching pool UTxO datums and transaction data...")
  const poolUTxOsWithDatumAndTimestamp = await processBatch(
    poolUTxOsWithTimestamp,
    async (utxo, idx) => {
      let rawDatum: string | undefined
      try {
        const [datum, tx] = await Promise.all([
          utxo.data_hash
            ? blockfrost.getDatum(utxo.data_hash).catch((err) => {
                logger.error(err, `Error fetching datum for ${utxo.data_hash}:`)
                throw err
              })
            : Promise.resolve(undefined),
          blockfrostFetch(`/txs/${utxo.tx_hash}`) as Promise<TransactionData>,
        ])
        rawDatum = datum

        if (!rawDatum) {
          throw new Error(`Couldn't get pool datum for ${utxo.tx_hash}`)
        }

        return {
          poolDatum: Data.from(rawDatum, PoolDatum),
          timestamp: new Date(utxo.blockTime * 1000).toISOString(),
          block_hash: tx.block,
          block_slot: tx.slot,
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : JSON.stringify(error)
        logger.info(
          `Skipping pool UTxO ${utxo.tx_hash} (${idx + 1}/${
            poolUTxOsWithTimestamp.length
          }) because its datum could not be decoded: ${message}`,
        )
        return null
      }
    },
    5,
    300,
  ).then((results) =>
    results.filter(
      (utxo): utxo is PoolUTxoWithDatumAndTimestamp => utxo !== null,
    ),
  )

  if (poolUTxOsWithDatumAndTimestamp.length === 0) {
    logger.info("No valid pool UTxOs with datum found")
    return
  }
  logger.info(
    `Enriched ${poolUTxOsWithDatumAndTimestamp.length} pool UTxOs with datum, timestamp and block data`,
  )

  logger.info("Fetching oracle UTxO datums and transaction data...")
  const oracleUTxOsWithDatumAndTimestamp = await processBatch(
    oracleUTXOsWithTimestamp,
    async (utxo, idx) => {
      try {
        const [rawDatum, tx] = await Promise.all([
          utxo.data_hash
            ? blockfrost.getDatum(utxo.data_hash).catch((err) => {
                logger.error(err, `Error fetching datum for ${utxo.data_hash}:`)
                throw err
              })
            : Promise.resolve(undefined),
          blockfrostFetch(`/txs/${utxo.tx_hash}`) as Promise<TransactionData>,
        ])

        if (!rawDatum) {
          throw new Error(`Couldn't get oracle datum for ${utxo.tx_hash}`)
        }

        return {
          oracleDatum: Data.from(rawDatum, OracleDatum),
          timestamp: new Date(utxo.blockTime * 1000).toISOString(),
          block_hash: tx.block,
          block_slot: tx.slot,
        }
      } catch (error) {
        logger.error(
          error,
          `Error processing oracle UTxO ${idx + 1}/${oracleUTXOsWithTimestamp.length}:`,
        )
        logger.debug("Skipping this UTxO and continuing...")
        return null
      }
    },
    5,
    300,
  ).then((results) =>
    results.filter(
      (utxo): utxo is OracleUTxoWithDatumAndTimestamp => utxo !== null,
    ),
  )

  if (oracleUTxOsWithDatumAndTimestamp.length === 0) {
    logger.info("No valid oracle UTxOs with datum found")
    return
  }
  logger.info(
    `Enriched ${oracleUTxOsWithDatumAndTimestamp.length} oracle UTxOs with datum, timestamp, and block data`,
  )

  const orderedTxOs: OrderedPoolOracleTxOs[] = [
    ...poolUTxOsWithDatumAndTimestamp.map((datum) => ({
      key: "pool" as const,
      value: {
        poolDatum: datum.poolDatum,
        timestamp: datum.timestamp,
        block_hash: datum.block_hash,
        block_slot: datum.block_slot,
      },
    })),
    ...oracleUTxOsWithDatumAndTimestamp.map((datum) => ({
      key: "oracle" as const,
      value: {
        oracleDatum: datum.oracleDatum,
        timestamp: datum.timestamp,
        block_hash: datum.block_hash,
        block_slot: datum.block_slot,
      },
    })),
  ].sort((a, b) => (a.value.timestamp < b.value.timestamp ? -1 : 1))

  return orderedTxOs
}

export const getStartIso = (period: Period) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (period) {
    case "D":
      return today
    case "W": {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      return start
    }
    case "M": {
      const start = new Date(today)
      start.setDate(start.getDate() - 29)
      return start
    }
    case "Y": {
      const start = new Date(today)
      start.setUTCFullYear(start.getUTCFullYear() - 1)
      return start
    }
    case "All":
      return undefined
  }
}

export const toDayString = (d: Date | string) =>
  new Date(d).toISOString().slice(0, 10)

export function processAnalyticsDataToInsert<
  T extends { timestamp: Date | string },
>(data: T[]) {
  const today = toDayString(new Date())

  const sorted = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  // if the current day was processed remove it, as the data is incomplete and should not be recorded
  const last = sorted[sorted.length - 1]
  if (last && toDayString(last.timestamp) === today) {
    sorted.pop()
  }

  return sorted
}

export async function writeOrderedTxOsToFile(
  data: OrderedPoolOracleTxOs[],
  filePath: string,
): Promise<void> {
  const absolutePath = path.resolve(filePath)

  const json = JSONbig.stringify(data)

  await fsPromises.writeFile(absolutePath, json, {
    encoding: "utf-8",
  })
}

function normalizePoolDatum(
  pool: PoolUTxoWithDatumAndTimestamp["poolDatum"],
): PoolUTxoWithDatumAndTimestamp["poolDatum"] {
  return {
    ...pool,
    adaInReserve: BigInt(pool.adaInReserve),
    djedInCirculation: BigInt(pool.djedInCirculation),
    shenInCirculation: BigInt(pool.shenInCirculation),
    minADA: BigInt(pool.minADA),
    _1: BigInt(pool._1),
  }
}

function normalizeOracleDatum(
  oracle: OracleUTxoWithDatumAndTimestamp["oracleDatum"],
): OracleUTxoWithDatumAndTimestamp["oracleDatum"] {
  return {
    ...oracle,
    oracleFields: {
      ...oracle.oracleFields,
      adaUSDExchangeRate: {
        numerator: BigInt(oracle.oracleFields.adaUSDExchangeRate.numerator),
        denominator: BigInt(oracle.oracleFields.adaUSDExchangeRate.denominator),
      },
    },
  }
}

function normalizeOrderedTxO(
  txo: OrderedPoolOracleTxOs,
): OrderedPoolOracleTxOs {
  if (txo.key === "pool") {
    return {
      ...txo,
      value: {
        ...txo.value,
        poolDatum: normalizePoolDatum(txo.value.poolDatum),
      },
    }
  }

  return {
    ...txo,
    value: {
      ...txo.value,
      oracleDatum: normalizeOracleDatum(txo.value.oracleDatum),
    },
  }
}

export async function readOrderedTxOsFromFile(
  filePath: string,
): Promise<OrderedPoolOracleTxOs[]> {
  const absolutePath = path.resolve(filePath)

  const raw = await fsPromises.readFile(absolutePath, "utf-8")
  const parsed = JSONbig.parse(raw) as OrderedPoolOracleTxOs[]

  return parsed.map(normalizeOrderedTxO)
}
