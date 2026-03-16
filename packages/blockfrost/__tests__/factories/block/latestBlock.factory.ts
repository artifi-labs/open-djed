import type { LatestBlock } from "../../../src/schemas/block/latestblock.schema"

const defaults: LatestBlock = {
  time: 1_700_000_000,
  height: 10_000_000,
  hash: "0000000000000000000000000000000000000000000000000000000000000000",
  slot: 100_000_000,
  epoch: 450,
  epoch_slot: 100_000,
  slot_leader: "pool1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
  size: 90_112,
  tx_count: 12,
  output: "1000000000",
  fees: "500000",
  block_vrf: "vrf_vk1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
  op_cert: "0000000000000000000000000000000000000000000000000000000000000000",
  op_cert_counter: 10,
  previous_block: "0000000000000000000000000000000000000000000000000000000000000001",
  next_block: "0000000000000000000000000000000000000000000000000000000000000002",
  confirmations: 1,
}

export function createLatestBlock(overrides: Partial<LatestBlock> = {}): LatestBlock {
  return { ...defaults, ...overrides }
}