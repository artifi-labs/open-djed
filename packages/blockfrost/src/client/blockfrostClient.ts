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
import { type EvalRedeemer, type Transaction } from "@lucid-evolution/lucid"

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

  async evaluateTx(tx: Transaction): Promise<EvalRedeemer[]> {
    const payload = {
      cbor: tx,
      additionalUtxoSet: [],
    }

    const res = await fetch(`${this.url}/utils/txs/evaluate/utxos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        project_id: this.projectId,
      },
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
