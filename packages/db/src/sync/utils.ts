import type { Actions, Token } from "../../generated/prisma/enums"
import { env } from "../../lib/env"
import { Blockfrost } from "@open-djed/blockfrost"
import { registryByNetwork } from "@open-djed/registry"
import { credentialToAddress, getAddressDetails } from "@lucid-evolution/lucid"
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
  type ReserveRatio,
  type OracleUTxoWithDatumAndTimestamp,
  type PoolUTxoWithDatumAndTimestamp,
  type DailyUTxOs,
  type DailyUTxOsWithWeights,
  type WeightedReserveEntry,
  type ReserveEntries,
} from "./types"

import fs from "fs"
import path from "path"
import { logger } from "../utils/logger"
import { reserveRatio } from "@open-djed/math"
import {
  CancelOrderSpendRedeemerHash,
  ProcessOrderSpendOrderRedeemerHash,
  type OrderDatum,
} from "@open-djed/data"

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

export async function getEveryResultFromPaginatedEndpoint(endpoint: string) {
  logger.info("Fetching all transactions...")
  const everyOrderTx: Transaction[] = []
  let txPage = 1
  while (txPage < 5) {
    try {
      logger.debug(`Fetching transaction page ${txPage}...`)
      const pageResult = (await blockfrostFetch(
        `${endpoint}?page=${txPage}&count=100&order=desc`,
      )) as Transaction[]

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

const getUtcDayKey = (timestamp: string) => timestamp.slice(0, 10)
const formatDayIso = (day: string) => `${day}T00:00:00.000Z`
const formatDayEndIso = (day: string) => `${day}T23:59:59.999Z`
const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_DAY_BIGINT = BigInt(MS_PER_DAY)

export const breakIntoDays = (entries: ReserveEntries[]): DailyUTxOs[] => {
  const buckets = new Map<string, ReserveEntries[]>()
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

export const assignTimeWeightsToDailyUTxOs = (
  dailyChunks: DailyUTxOs[],
): DailyUTxOsWithWeights[] => {
  let previousDayLastTimestampMs: number | null = null
  let activePoolDatum: PoolUTxoWithDatumAndTimestamp["poolDatum"] | null = null
  let activeOracleDatum: OracleUTxoWithDatumAndTimestamp["oracleDatum"] | null =
    null
  let activePoolEntry: ReserveEntries | null = null
  let activeOracleEntry: ReserveEntries | null = null

  return dailyChunks.map((dailyDayChunk, chunkIndex) => {
    const timedEntries: WeightedReserveEntry[] = dailyDayChunk.entries.map(
      (entry) => ({
        ...entry,
        weight: 0,
      }),
    )

    const dayStartMs = Date.parse(dailyDayChunk.startIso)
    const dayEndMs = Date.parse(dailyDayChunk.endIso)

    const gapStartMs =
      chunkIndex === 0
        ? dayStartMs
        : Math.max(previousDayLastTimestampMs ?? dayStartMs, dayStartMs)

    let previousTimestampMs = gapStartMs

    timedEntries.forEach((currentEntry, index) => {
      if (currentEntry.key === "pool") {
        activePoolDatum = currentEntry.value.poolDatum
        activePoolEntry = currentEntry
      } else {
        activeOracleDatum = currentEntry.value.oracleDatum
        activeOracleEntry = currentEntry
      }

      const currentTimestampMs = Date.parse(currentEntry.value.timestamp)
      const isLastEntry = index === timedEntries.length - 1
      const intervalStartMs = isLastEntry
        ? currentTimestampMs
        : previousTimestampMs
      const intervalEndMs = isLastEntry ? dayEndMs : currentTimestampMs
      const intervalStartIso = new Date(intervalStartMs).toISOString()
      const intervalEndIso = new Date(intervalEndMs).toISOString()

      if (
        activePoolDatum &&
        activeOracleDatum &&
        activePoolEntry &&
        activeOracleEntry
      ) {
        currentEntry.ratio = reserveRatio(
          activePoolDatum,
          activeOracleDatum,
        ).toNumber()
        currentEntry.period = {
          start: intervalStartIso,
          end: intervalEndIso,
        }
        // console.log("reserve ratio period", {
        //   day: dailyDayChunk.day,
        //   timestamp: currentEntry.value.timestamp,
        //   source: currentEntry.key,
        //   ratio: currentEntry.ratio,
        //   poolUTxO: activePoolEntry.value,
        //   oracleUTxO: activeOracleEntry.value,
        //   oracleExchangeRate: getOracleExchangeRate(activeOracleEntry),
        //   period: {
        //     start: new Date(intervalStartMs).toISOString(),
        //     end: new Date(intervalEndMs).toISOString(),
        //   },
        // })
      }
      let duration = Math.max(0, currentTimestampMs - previousTimestampMs)

      if (index === timedEntries.length - 1) {
        duration = Math.max(0, dayEndMs - currentTimestampMs)
      }

      currentEntry.weight = duration
      previousTimestampMs = currentTimestampMs
    })

    const lastEntry = timedEntries.at(-1)
    if (lastEntry) {
      previousDayLastTimestampMs = Date.parse(lastEntry.value.timestamp)
    }

    return {
      ...dailyDayChunk,
      entries: timedEntries,
    }
  })
}

export const getTimeWeightedDailyReserveRatio = (
  dailyChunks: DailyUTxOsWithWeights[],
): ReserveRatio[] => {
  const dailyReserveRatios: ReserveRatio[] = []

  for (const chunk of dailyChunks) {
    let weightedSumNumber = 0
    let durationSum = 0n

    for (const entry of chunk.entries) {
      if (entry.ratio === undefined || entry.weight <= 0) continue
      const duration = BigInt(entry.weight)
      durationSum += duration
      weightedSumNumber += entry.ratio * Number(duration)
    }

    if (durationSum === 0n) continue

    const averageRatio = weightedSumNumber / MS_PER_DAY
    const coverageFraction = Number(durationSum) / MS_PER_DAY
    const fullDayCoverage = durationSum === MS_PER_DAY_BIGINT

    const latestEntry = chunk.entries.at(-1)
    if (!latestEntry) continue

    // console.log("daily reserve ratio", {
    //   day: chunk.day,
    //   average_ratio: averageRatio*100,
    //   coverage_fraction: coverageFraction,
    //   coverage_full_day: fullDayCoverage,
    //   weights_total_ms: durationSum.toString(),
    // })

    dailyReserveRatios.push({
      // id: 0,
      timestamp: latestEntry.value.timestamp,
      reserveRatio: averageRatio,
      block: latestEntry.value.block_hash,
      slot: latestEntry.value.block_slot,
    })
  }

  return dailyReserveRatios
}

export const dumpDayChunkToJsonFile = (
  chunks: DailyUTxOsWithWeights[],
  targetDay: string,
) => {
  const chunk = chunks.find((c) => c.day === targetDay)
  if (!chunk) {
    console.warn(`Day ${targetDay} not found for JSON dump`)
    return
  }

  const logDir = path.join(process.cwd(), "logs")
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const replacer = (_key: string, value: unknown) =>
    typeof value === "bigint" ? value.toString() : value

  const out = {
    day: chunk.day,
    startIso: chunk.startIso,
    endIso: chunk.endIso,
    entries: chunk.entries.map((entry) => ({
      key: entry.key,
      timestamp: entry.value.timestamp,
      block_hash: entry.value.block_hash,
      block_slot: entry.value.block_slot,
      weight: entry.weight,
      ratio: entry.ratio,
      period: entry.period,
      value: entry.value,
    })),
  }

  const filePath = path.join(logDir, `reserve-ratio-${targetDay}.json`)
  fs.writeFileSync(filePath, JSON.stringify(out, replacer, 2))
  console.log(`Dumped day ${targetDay} chunk to ${filePath}`)
}
