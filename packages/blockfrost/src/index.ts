import * as Lucid from "@lucid-evolution/lucid"
import { type EvalRedeemer, type Transaction } from "@lucid-evolution/lucid"
import packageJson from "../../cli/package.json" with { type: "json" }
import { z } from "zod"
import type { AddressTransactionQueryParams, AddressTransactionsParams, AddressTransactionsResponse, GetAddressTransactionsParams } from "./types/address/addressTransaction"
import { fetchWithRetry } from "./utils"
import type { AddressUtxoParams, AddressUtxoQueryParams, AddressUtxoResponse, TransactionUtxoParams, TransactionUtxoResponse } from "./types/transaction/transactionUtxo"
import { logger } from "../../db/src/utils/logger"

const BlockSchema = z.object({
  slot: z.number(),
})

export const getLatestBlockSlot = ({
  url,
  projectId,
  lucid,
}: {
  url: string
  projectId?: string
  lucid: string
}) =>
  fetch(`${url}/blocks/latest`, {
    headers: {
      ...(projectId ? { project_id: projectId } : {}),
      lucid,
    },
  }).then(async (res) => BlockSchema.parse(await res.json()).slot)

export class Blockfrost extends Lucid.Blockfrost {

  private normalizeHeaders(headers?: any): Record<string, string> {
    if (!headers) return {}
    if (headers instanceof Headers) return Object.fromEntries(headers.entries())
    if (Array.isArray(headers)) return Object.fromEntries(headers)
    return { ...headers }
  }

  private withAuthHeaders(options: RequestInit = {}): RequestInit {
    const baseHeaders = this.normalizeHeaders(options.headers)
    const headers: Record<string, string> = {
      ...baseHeaders,
      ...(this.projectId ? { project_id: this.projectId } : {}),
      lucid,
    }
    return { ...options, headers }
  }

  private async fetchAllPages<T>(
    endpoint: string,
    count: number = 100,
    useRetry?: { retry?: number; retryDelayMs?: number }
  ): Promise<T[]> {
    const results: T[] = []
    let page = 1

    while (true) { // TODO: CHANGE THIS TO TRUE
      const separator = endpoint.includes("?") ? "&" : "?"
      const url = `${endpoint}${separator}page=${page}&count=${count}`

      let pageResult: T[]
      try {
        pageResult = await this.request<T[]>(url, {}, useRetry)
      } catch (err) {
        logger.error(`Error fetching page ${page} from ${endpoint}: ${err}`)
        break
      }

      if (!Array.isArray(pageResult) || pageResult.length === 0) break

      results.push(...pageResult)
      page++
    }

    return results
  }

  private async request<T>(
    url: string,
    options: RequestInit = {},
    useRetry: { retry?: number; retryDelayMs?: number; allPages?: boolean } = {}
  ): Promise<T> {
    const fetchOptions = this.withAuthHeaders(options)

    const retries = useRetry.retry ?? 0
    const delayMs = useRetry.retryDelayMs ?? 10_000

    if (useRetry.allPages) {
      logger.error(url)
      return this.fetchAllPages<T>(url, 100, { retry: retries, retryDelayMs: delayMs }) as T
    }

    if (retries > 0) {
      logger.error(url)
      return fetchWithRetry<T>(url, fetchOptions, retries, delayMs)
    }

    const res = await fetch(url, fetchOptions)
    if (!res.ok) {
      logger.error(`Request failed: ${url}. Status: ${res.status}`)
      throw new Error(`Request failed: ${url}. Status: ${res.status}`)
    }
    return (await res.json()) as T
  }

  getLatestBlockSlot() {
    return getLatestBlockSlot({
      url: this.url,
      projectId: this.projectId,
      lucid,
    })
  }

  async getAddressTransactions(
    params: AddressTransactionsParams,
    query?: AddressTransactionQueryParams,
    options?: { retry?: number; retryDelayMs?: number; allPages?: boolean }
  ): Promise<AddressTransactionsResponse> {
    const { address } = params

    const queryString = query
      ? "?" +
        Object.entries(query)
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join("&")
      : ""

    const url = `${this.url}/addresses/${address}/transactions${queryString}`
  
    return this.request<AddressTransactionsResponse>(url, {}, options)
  }

  async getTransactionUTxOs(
    params: TransactionUtxoParams,
    options?: { retry?: number; retryDelayMs?: number; }
  ): Promise<TransactionUtxoResponse> {
    const { hash } = params

    const url = `${this.url}/txs/${hash}/utxos`

    return this.request<TransactionUtxoResponse>(url, {}, options)
  }     

  async evaluateTx(tx: Transaction): Promise<EvalRedeemer[]> {
    const payload = {
      cbor: tx,
      additionalUtxoSet: [],
    }

    const res = await fetch(`${this.url}/utils/txs/evaluate/utxos?version=6`, {
      method: "POST",
      ...this.withAuthHeaders({
        headers: {
          "Content-Type": "application/json",
        },
      }),
      body: JSON.stringify(payload),
    }).then(
      (res) =>
        res.json() as {
          fault?: unknown
          status_code?: number
          message?: string
        },
    )
    if (!res || res.fault) {
      const message =
        res.status_code === 400
          ? res.message
          : `Could not evaluate the transaction: ${JSON.stringify(res)}. Transaction: ${tx}`
      throw new Error(message)
    }
    const blockfrostRedeemer = res as BlockfrostRedeemer
    if (!("EvaluationResult" in blockfrostRedeemer.result)) {
      throw new Error(
        `EvaluateTransaction fails: ${JSON.stringify(blockfrostRedeemer.result)} for transaction ${tx}`,
      )
    }
    const evalRedeemers: EvalRedeemer[] = []
    Object.entries(blockfrostRedeemer.result.EvaluationResult).forEach(
      ([redeemerPointer, data]) => {
        const [pTag, pIndex] = redeemerPointer.split(":")
        evalRedeemers.push({
          redeemer_tag: fromLegacyRedeemerTag(pTag as LegacyRedeemerTag),
          redeemer_index: Number(pIndex),
          ex_units: { mem: Number(data.memory), steps: Number(data.steps) },
        })
      },
    )

    return evalRedeemers
  }
}

type BlockfrostRedeemer = {
  result:
    | {
        EvaluationResult: {
          [key: string]: {
            memory: number
            steps: number
          }
        }
      }
    | {
        CannotCreateEvaluationContext: unknown
      }
}

const lucid = packageJson.version // Lucid version

export type LegacyRedeemerTag = "spend" | "mint" | "certificate" | "withdrawal"

export const fromLegacyRedeemerTag = (redeemerTag: LegacyRedeemerTag) => {
  switch (redeemerTag) {
    case "certificate":
      return "publish"
    case "withdrawal":
      return "withdraw"
    default:
      return redeemerTag
  }
}
