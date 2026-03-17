import type { BlockfrostClient } from "../client/blockfrostClient"
import {
  transactionUtxoSchema,
  type TransactionUtxo,
} from "../schemas/transaction/transactionUtxo.schema"

export class TransactionsService {
  private basePath: string = "/txs"

  constructor(private client: BlockfrostClient) {}

  /**
   * GET /txs/{tx_hash}/utxos
   */
  async getTransactionUtxos(address: string): Promise<TransactionUtxo> {
    return this.client.request(
      `${this.basePath}/${address}/utxos`,
      transactionUtxoSchema,
    )
  }
}
