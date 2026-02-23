import { z } from "zod"
import type { RequestOrderOptions } from "../types"

const AssetTransactionSchema = z.object({
  tx_hash: z.string(),
  tx_index: z.number(),
  block_height: z.number(),
  block_time: z.number(),
})

export const AssetTransactionsSchema = z.array(AssetTransactionSchema)

export type AssetTransaction = z.infer<typeof AssetTransactionSchema>
export type AssetTransactionsResponse = z.infer<typeof AssetTransactionsSchema>

export type GetAssetTransactionsParams = {
  asset: string
} & RequestOrderOptions