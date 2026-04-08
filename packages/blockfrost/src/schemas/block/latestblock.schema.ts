import { z } from "zod"

export const latestBlockSchema = z.object({
  time: z.number(),
  height: z.number(),
  hash: z.string(),
  slot: z.number(),
  epoch: z.number(),
  epoch_slot: z.number(),
  slot_leader: z.string(),
  size: z.number(),
  tx_count: z.number(),
  output: z.string().nullable(),
  fees: z.string().nullable(),
  block_vrf: z.string(),
  op_cert: z.string().nullable(),
  op_cert_counter: z.string().nullable(),
  previous_block: z.string(),
  next_block: z.string().nullable(),
  confirmations: z.number(),
})

export type LatestBlock = z.infer<typeof latestBlockSchema>
