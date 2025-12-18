import type { OrderDatum } from '@open-djed/data'
import type { Actions, Token } from '../generated/prisma/enums'
import { env } from '../lib/env'
import { Blockfrost } from '@open-djed/blockfrost'
import { registryByNetwork } from '@open-djed/registry'

const blockfrostUrl = env.BLOCKFROST_URL
const blockfrostId = env.BLOCKFROST_PROJECT_ID
export const blockfrost = new Blockfrost(blockfrostUrl, blockfrostId)
const network = env.NETWORK
export const registry = registryByNetwork[network]

export const SAFETY_MARGIN = 50 // updates database 50 slots behind the tip of the blockchain

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function blockfrostFetch(path: string, init?: RequestInit) {
  return fetchWithRetry(`${blockfrostUrl}${path}`, {
    ...init,
    headers: {
      project_id: blockfrostId,
      ...(init?.headers ?? {}),
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
  retries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        if (response.status === 429) {
          // rate limited
          console.log(`Rate limited, waiting ${delayMs * 2}ms...`)
          await sleep(delayMs * 2)
          continue
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response')
      }

      return JSON.parse(text) as T
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`Attempt ${i + 1} failed, retrying in ${delayMs}ms...`, error)
      await sleep(delayMs)
    }
  }
  throw new Error('All retry attempts failed')
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
  delayMs: number = 0,
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map((item, idx) => processor(item, i + idx)))
    results.push(...batchResults)

    if (delayMs > 0 && i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * parses an Order datum and returns normalized values
 * @param d a decoded Order datum
 * @returns
 */
export function parseOrderDatum(d: OrderDatum) {
  const entries = Object.entries(d.actionFields)

  if (entries.length === 0) {
    throw new Error('OrderDatum has no actionFields')
  }

  const firstEntry = entries[0]
  if (!firstEntry) {
    throw new Error('OrderDatum has no actionFields')
  }

  const [actionName, values] = firstEntry

  const action: Actions = actionName.startsWith('Mint') ? 'Mint' : 'Burn'

  let token: Token
  if (actionName.includes('SHEN')) token = 'SHEN'
  else if (actionName.includes('DJED')) token = 'DJED'
  else token = 'BOTH'

  const paid: bigint = values.adaAmount ?? 0n

  let received: bigint = 0n

  if ('shenAmount' in values && typeof values.shenAmount === 'bigint') {
    received += values.shenAmount
  }
  if ('djedAmount' in values && typeof values.djedAmount === 'bigint') {
    received += values.djedAmount
  }

  return {
    action,
    token,
    paid,
    received,
  }
}
