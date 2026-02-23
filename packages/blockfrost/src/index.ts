  import * as Lucid from "@lucid-evolution/lucid"
  import { type EvalRedeemer, type Transaction } from "@lucid-evolution/lucid"
  import packageJson from "../../cli/package.json" with { type: "json" }
  import { fetchJSON } from "./utils"
  import type { GetTransactionUTxOsParams, TransactionUtxoResponse } from "./types/transaction/transactionUtxo"
  import type { AddressTransactionsResponse, GetAddressTransactionsParams } from "./types/address/addressTransaction"
  import type { LatestBlockResponse } from "./types/block/block"
  import type { AssetTransactionsResponse, GetAssetTransactionsParams } from "./types/assets/asset"
  import type { RequestRetryOptions } from "./types/types"
  import { logger } from "../logger"
  import type { HeadersInit } from "bun"

  const lucid = packageJson.version

  export type LegacyRedeemerTag = "spend" | "mint" | "certificate" | "withdrawal"

  export const fromLegacyRedeemerTag = (tag: LegacyRedeemerTag): string => {
    switch (tag) {
      case "certificate": return "publish"
      case "withdrawal": return "withdraw"
      default: return tag
    }
  }

  type BlockfrostRedeemer = {
    result:
      | { EvaluationResult: Record<string, { memory: number; steps: number }> }
      | { CannotCreateEvaluationContext: unknown }
  }

  type PaginationOptions = {
    count?: number
    maxPages?: number
  }

  type FilterCondition<T> = (item: T) => boolean

  type FilterAndStop<T> = {
    filter?: (item: T) => boolean
    stop?: (item: T) => boolean
  }

  class BlockfrostRequest<T> implements PromiseLike<T> {
    private retryTimes = 0
    private retryDelay = 10_000
    private fetchPages = false
    private paginationOptions: PaginationOptions = {}
    private filters: FilterCondition<T extends Array<infer U> ? U : never>[] = []
    private _stopCondition?: (item: T extends Array<infer U> ? U : never) => boolean

    constructor(
      private readonly executeSingle: (opts: RequestRetryOptions) => Promise<T>,
      private readonly executePages?: (opts: RequestRetryOptions, pagination: PaginationOptions, itemFilter?: (item: T extends Array<infer U> ? U : never) => boolean, stopCondition?: (item: T extends Array<infer U> ? U : never) => boolean) => Promise<T>,
    ) {}

    retry(times = 5, delayMs = 10_000): this {
      this.retryTimes = times
      this.retryDelay = delayMs
      return this
    }

    allPages(options: PaginationOptions = {}): this {
      if (!this.executePages) throw new Error("This endpoint does not support pagination")
      this.fetchPages = true
      this.paginationOptions = options
      return this
    }

    filter(condition: FilterCondition<T extends Array<infer U> ? U : never>): this {
      this.filters.push(condition)
      return this
    }

    withFilter(fn: (item: T extends Array<infer U> ? U : never) => FilterAndStop<T extends Array<infer U> ? U : never>): this {
      this.filter(item => {
        const { filter } = fn(item)
        return filter !== undefined ? filter(item) : true
      })
      this._stopCondition = item => {
        const { stop } = fn(item)
        return stop !== undefined ? stop(item) : false
      }
      return this
    }

    private buildItemFilter(): ((item: T extends Array<infer U> ? U : never) => boolean) | undefined {
      if (this.filters.length === 0) return undefined
      return item => this.filters.every(f => f(item))
    }

    then<R1 = T, R2 = never>(
      onfulfilled?: ((value: T) => R1 | PromiseLike<R1>) | null,
      onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
    ): Promise<R1 | R2> {
      const opts: RequestRetryOptions = { retry: this.retryTimes, retryDelayMs: this.retryDelay }
      const itemFilter = this.buildItemFilter()

      const promise = this.fetchPages && this.executePages
        ? this.executePages(opts, this.paginationOptions, itemFilter, this._stopCondition)
        : this.executeSingle(opts)

      return promise.then(onfulfilled, onrejected)
    }
  }

  export class Blockfrost extends Lucid.Blockfrost {
    private normalizeHeaders(headers?: HeadersInit): Record<string, string> {
      if (!headers) return {}
      if (headers instanceof Headers) return Object.fromEntries(headers.entries())
      if (Array.isArray(headers)) return Object.fromEntries(headers)
      return { ...headers } as Record<string, string>
    }

    private withAuthHeaders(options: RequestInit = {}): RequestInit {
      return {
        ...options,
        headers: {
          ...this.normalizeHeaders(options.headers),
          ...(this.projectId ? { project_id: this.projectId } : {}),
          lucid,
        },
      }
    }

    private buildQueryString(params: Record<string, unknown>): string {
      const entries = Object.entries(params)
        .filter(([, val]) => val !== undefined)
        .map(([key, val]) => `${key}=${encodeURIComponent(String(val))}`)
      return entries.length ? "?" + entries.join("&") : ""
    }

    private async request<T>(
      url: string,
      options: RequestInit = {},
      retryOptions?: RequestRetryOptions
    ): Promise<T> {
      return fetchJSON<T>(url, this.withAuthHeaders(options), retryOptions)
    }

    private async fetchAllPages<T>(
      endpoint: string,
      retryOptions?: RequestRetryOptions,
      pagination: PaginationOptions = {},
      itemFilter?: (item: T) => boolean,
      stopCondition?: (item: T) => boolean
    ): Promise<T[]> {
      const { count = 100, maxPages = Infinity } = pagination
      const results: T[] = []
      let page = 1

      while (page <= maxPages) {
        const sep = endpoint.includes("?") ? "&" : "?"
        const url = `${endpoint}${sep}page=${page}&count=${count}`

        let pageResult: T[]
        try {
          pageResult = await this.request<T[]>(url, {}, retryOptions)
        } catch (err) {
          logger.error(`Error fetching page ${page} from ${endpoint}: ${err}`)
          break
        }

        if (!Array.isArray(pageResult) || pageResult.length === 0) break

        for (const item of pageResult) {
          if (stopCondition && stopCondition(item)) return results
          if (!itemFilter || itemFilter(item)) results.push(item)
        }

        page++
      }

      return results
    }

    getLatestBlockSlot() {
      const url = `${this.url}/blocks/latest`

      return new BlockfrostRequest<LatestBlockResponse>(
        (opts) => this.request<LatestBlockResponse>(url, {}, opts)
      )
    }

    getAddressTransactions({ address, ...query }: GetAddressTransactionsParams) {
      const url = `${this.url}/addresses/${address}/transactions${this.buildQueryString(query)}`

      return new BlockfrostRequest<AddressTransactionsResponse>(
        (opts) => this.request<AddressTransactionsResponse>(url, {}, opts),
        (opts, pagination, filter, stopCondition) => this.fetchAllPages<AddressTransactionsResponse[number]>(url, opts, pagination, filter, stopCondition) as Promise<AddressTransactionsResponse>,
      )
    }

    getTransactionUTxOs({ hash }: GetTransactionUTxOsParams) {
      return new BlockfrostRequest<TransactionUtxoResponse>(
        (opts) => this.request<TransactionUtxoResponse>(`${this.url}/txs/${hash}/utxos`, {}, opts),
      )
    }

    getAssetTransactions({ asset, ...query }: GetAssetTransactionsParams) {
      const url = `${this.url}/assets/${asset}/transactions${this.buildQueryString(query)}`

      return new BlockfrostRequest<AssetTransactionsResponse>(
        (opts) => this.request<AssetTransactionsResponse>(url, {}, opts),
        (opts, pagination, filter, stopCondition) => this.fetchAllPages<AssetTransactionsResponse[number]>(url, opts, pagination, filter, stopCondition) as Promise<AssetTransactionsResponse>,
      )
    }

    async evaluateTx(tx: Transaction): Promise<EvalRedeemer[]> {
      const res = await fetch(`${this.url}/utils/txs/evaluate/utxos?version=6`, {
        method: "POST",
        ...this.withAuthHeaders({ headers: { "Content-Type": "application/json" } }),
        body: JSON.stringify({ cbor: tx, additionalUtxoSet: [] }),
      }).then((r) => r.json() as Promise<{ fault?: unknown; status_code?: number; message?: string }>)

      if (!res || res.fault) {
        throw new Error(
          res.status_code === 400
            ? res.message
            : `Could not evaluate the transaction: ${JSON.stringify(res)}. Transaction: ${tx}`
        )
      }

      const bf = res as unknown as BlockfrostRedeemer
      if (!("EvaluationResult" in bf.result)) {
        throw new Error(`EvaluateTransaction fails: ${JSON.stringify(bf.result)} for transaction ${tx}`)
      }

      return Object.entries(bf.result.EvaluationResult).map(([pointer, data]) => {
        const [pTag, pIndex] = pointer.split(":")
        return {
          redeemer_tag: fromLegacyRedeemerTag(pTag as LegacyRedeemerTag) as Lucid.RedeemerTag,
          redeemer_index: Number(pIndex),
          ex_units: { mem: Number(data.memory), steps: Number(data.steps) },
        }
      })
    }
  }