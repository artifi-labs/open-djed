import { z } from "zod"

export const VolumesEntrySchema = z.object({
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

export const VolumesResponseSchema = z.array(VolumesEntrySchema)

export type VolumesEntry = z.infer<typeof VolumesEntrySchema>
export type VolumesResponse = z.infer<typeof VolumesResponseSchema>
