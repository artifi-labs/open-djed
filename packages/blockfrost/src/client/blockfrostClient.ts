import { Blockfrost } from "@lucid-evolution/lucid"
import { BlockService } from "../services"
import { Network } from "../types/network.types"
import type { ZodSchema } from "zod"
import { BlockfrostError } from "../errors/blockfrost.error"
import type { QueryParams } from "../types/http.types"

export class BlockfrostClient extends Blockfrost {
  public blocks: BlockService

  constructor(
    public apiKey: string,
    public network: Network = Network.MAINNET,
  ) {
    super(network, apiKey)
    this.blocks = new BlockService(this)
  }

  private get baseUrl() {
    return this.network
  }

  async request<T>(
    path: string,
    schema: ZodSchema<T>,
    query?: QueryParams,
  ): Promise<T> {
    const url = this.buildUrl(path, query)

    const res = await fetch(url, {
      headers: { project_id: this.apiKey },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new BlockfrostError(res.status, body, path)
    }

    const json: unknown = await res.json()
    return schema.parse(json)
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
