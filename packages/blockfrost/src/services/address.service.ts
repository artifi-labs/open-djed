import type { Blockfrost } from "../client/blockfrostClient"
import { PaginatedRequest } from "../client/paginatedRequest"
import {
  addressTransactionsResponseSchema,
  type AddressTransaction,
  type AddressTransactionsParams,
} from "../schemas/address/addresstransaction.schema"

export class AddressService {
  private basePath: string = "/addresses"

  constructor(private client: Blockfrost) {}

  /**
   * GET /addresses/{address}/transactions
   */
  getAddressTransactions(
    address: string,
    query?: AddressTransactionsParams,
  ): PaginatedRequest<AddressTransaction> {
    return new PaginatedRequest((page, count) =>
      this.client.request(
        `${this.basePath}/${address}/transactions`,
        addressTransactionsResponseSchema,
        { ...query, page, count },
      ),
    )
  }
}
