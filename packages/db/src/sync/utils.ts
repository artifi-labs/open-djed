import type { Actions, Token } from "../../generated/prisma/enums"
import { env } from "../../lib/env"
import { Blockfrost } from "@open-djed/blockfrost"
import { registryByNetwork } from "@open-djed/registry"
import { credentialToAddress } from "@lucid-evolution/lucid"
import type { OrderUTxOWithDatumAndBlock, UTxO } from "./types"

import fs from "fs"
import path from "path"
import { logger } from "../utils/logger"

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

    const userAddr = constructAddress(
      d.address.paymentKeyHash[0],
      d.address.stakeKeyHash[0][0][0],
      network,
    )

    const utxosOfConsumingTx = (await blockfrostFetch(
      `/txs/${orderUTxO.consumed_by_tx}/utxos`,
    )) as UTxO
    if (!utxosOfConsumingTx || !utxosOfConsumingTx.outputs) {
      return { action, token, paid, received: undefined }
    }

    const outputUTxOToUserAddr = utxosOfConsumingTx.outputs.find(
      (utxo) => utxo.address === userAddr,
    )
    if (!outputUTxOToUserAddr) {
      throw new Error(
        "Could not find output UTxO to user address in consuming transaction",
      )
    }

    received = BigInt(
      outputUTxOToUserAddr.amount.find((a) => a.unit === "lovelace")
        ?.quantity ?? "0",
    )
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
