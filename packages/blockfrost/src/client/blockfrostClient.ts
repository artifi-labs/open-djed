import { Blockfrost as BaseBlockfrost } from "@lucid-evolution/lucid"
import { AddressService, BlockService } from "../services"
import { Network } from "../types/network.types"
import type { ZodSchema } from "zod"
import { BlockfrostError } from "../errors/blockfrost.error"
import type { QueryParams } from "../types/http.types"
import { TransactionsService } from "../services/transaction.service"
import type { RetryOptions } from "../types/retry.types"
import { RequestBuilder } from "./requestBuilder"
import { PaginatedRequest } from "./paginatedRequest"

export class Blockfrost extends BaseBlockfrost {
  public blocks: BlockService
  public addresses: AddressService
  public transactions: TransactionsService

  constructor(
    public projectId: string,
    public network: Network = Network.MAINNET,
    private readonly globalRetry: RetryOptions = {},
  ) {
    super(network, projectId)
    this.blocks = new BlockService(this)
    this.addresses = new AddressService(this)
    this.transactions = new TransactionsService(this)
  }

  private get baseUrl() {
    return this.network
  }

  request<T>(
    path: string,
    schema: ZodSchema<T>,
    query?: QueryParams,
  ): RequestBuilder<T> {
    return new RequestBuilder(async (signal) => {
      const url = this.buildUrl(path, query)
      const res = await fetch(url, {
        headers: { project_id: this.projectId },
        signal,
      })

      if (!res.ok) {
        const body = await res.text()
        throw new BlockfrostError(res.status, body, path)
      }

      const json: unknown = await res.json()
      return schema.parse(json)
    }, this.globalRetry)
  }

  paginate<T>(
    path: string,
    schema: ZodSchema<T[]>,
    query?: QueryParams,
  ): PaginatedRequest<T> {
    return new PaginatedRequest(
      (page, count) => this.request(path, schema, { ...query, page, count }),
      this.globalRetry,
    )
  }

  private buildUrl(path: string, query?: QueryParams): string {
    if (!query) return `${this.baseUrl}${path}`

    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.set(key, String(value))
    }

    const qs = params.toString()
    return qs ? `${this.baseUrl}${path}?${qs}` : `${this.baseUrl}${path}`
  }
}
