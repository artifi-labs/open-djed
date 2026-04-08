import { z } from "zod"

export const latestBlockSchema = z.object({
  time: z.number(),
  height: z.number(),
  hash: z.string(),
  slot: z.number().nullable(),
  epoch: z.number().nullable(),
  epoch_slot: z.number().nullable(),
  slot_leader: z.string(),
  size: z.number(),
  tx_count: z.number(),
  output: z.string().nullable(),
  fees: z.string().nullable(),
  block_vrf: z.string().nullable(),
  op_cert: z.string().nullable(),
  op_cert_counter: z.string().nullable(),
  previous_block: z.string().nullable(),
  next_block: z.string().nullable(),
  confirmations: z.number(),
})

export type LatestBlock = z.infer<typeof latestBlockSchema>
