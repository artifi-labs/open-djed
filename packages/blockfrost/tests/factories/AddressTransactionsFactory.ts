import type { AddressTransaction } from "../../src/types/address/addressTransaction"

export const makeAddressTransaction = (
  overrides: Partial<AddressTransaction> = {}
): AddressTransaction => ({
  tx_hash: "tx_hash_default",
  tx_index: 0,
  block_height: 1000,
  block_time: 1700000000,
  ...overrides,
})

export const makeAddressTransactions = (count = 1): AddressTransaction[] =>
  Array.from({ length: count }, (_, i) =>
    makeAddressTransaction({
      tx_hash: `tx_hash_${i + 1}`,
      tx_index: i,
      block_height: 1000 + i,
      block_time: 1700000000 + i,
    })
  )