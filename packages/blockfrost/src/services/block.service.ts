import type { Blockfrost } from "../client/blockfrostClient"
import {
  type LatestBlock,
  latestBlockSchema,
} from "../schemas/block/latestblock.schema"

export class BlockService {
  private basePath: string = "/blocks"

  constructor(private client: Blockfrost) {}

  /**
   * GET /blocks/latest
   */
  async getLatest(): Promise<LatestBlock> {
    const data = await this.client.request(
      `${this.basePath}/latest`,
      latestBlockSchema,
    )
    return data
  }
}
