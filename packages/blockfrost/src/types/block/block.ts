import z from "zod";

export const LatestBlockSchema = z.object({
  time: z.number(),
  height: z.number(),
  hash: z.string(),
  slot: z.number(),
  epoch: z.number(),
  epoch_slot: z.number(),
  slot_leader: z.string(),
  size: z.number(),
  tx_count: z.number(),
  output: z.string(),
  fees: z.string(),
  block_vrf: z.string(),
  op_cert: z.string(),
  op_cert_counter: z.number(),
  previous_block: z.string(),
  next_block: z.string(),
  confirmations: z.number(),
})



export type LatestBlock = z.infer<typeof LatestBlockSchema>
export type LatestBlockResponse = z.infer<typeof LatestBlockSchema>