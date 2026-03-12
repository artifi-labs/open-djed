import { z } from "zod"

export const volumesEntrySchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  djedMintedUSD: z.number(),
  djedBurnedUSD: z.number(),
  shenMintedUSD: z.number(),
  shenBurnedUSD: z.number(),
  djedMintedADA: z.number(),
  djedBurnedADA: z.number(),
  shenMintedADA: z.number(),
  shenBurnedADA: z.number(),
  totalDjedVolumeUSD: z.number(),
  totalShenVolumeUSD: z.number(),
  totalDjedVolumeADA: z.number(),
  totalShenVolumeADA: z.number(),
  totalVolumeUSD: z.number(),
  totalVolumeADA: z.number(),
})

export const volumesResponseSchema = z.array(volumesEntrySchema)
