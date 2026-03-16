import type { BlockfrostClient } from "../client/blockfrostClient"
import { addressTransactionsResponseSchema, type AddressTransactionsParams, type AddressTransactionsResponse } from "../schemas/address/addresstransaction.schema"

export class AddressService {
  private basePath: string = "/addresses"
  
  constructor(private client: BlockfrostClient) {}
  
  /**
   * GET /addresses/{address}/transactions
   */
  async getAddressTransactions(address: string, query?: AddressTransactionsParams): Promise<AddressTransactionsResponse> {
    const data = await this.client.request(`${this.basePath}/${address}/transactions`, addressTransactionsResponseSchema, query)
    return data
  }
}
