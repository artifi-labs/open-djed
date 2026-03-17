import type { AddressTransaction } from "../../../src/schemas/address/addresstransaction.schema";
import { createFactory } from "../createFactory";

export const createAddressTransaction = createFactory<AddressTransaction>({
  tx_hash: "0000000000000000000000000000000000000000000000000000000000000000",
  tx_index: 0,
  block_height: 10_000_000,
  block_time: 1_700_000_000,
})