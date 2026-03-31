import { z } from "zod"

/**
 * Schemas for Volumes API response.
 */
export const VolumesEntryApiSchema = z.object({
  timestamp: z.coerce.string(),
  djedMintedUSD: z.coerce.string(),
  shenMintedUSD: z.coerce.string(),
  djedBurnedUSD: z.coerce.string(),
  shenBurnedUSD: z.coerce.string(),
  djedMintedADA: z.coerce.string(),
  djedBurnedADA: z.coerce.string(),
  shenMintedADA: z.coerce.string(),
  shenBurnedADA: z.coerce.string(),
  totalDjedVolumeUSD: z.coerce.string(),
  totalShenVolumeUSD: z.coerce.string(),
  totalDjedVolumeADA: z.coerce.string(),
  totalShenVolumeADA: z.coerce.string(),
  totalVolumeUSD: z.coerce.string(),
  totalVolumeADA: z.coerce.string(),
})

export const VolumesResponseApiSchema = z.array(VolumesEntryApiSchema)
export type VolumesEntryApi = z.infer<typeof VolumesEntryApiSchema>
export type VolumesResponseApi = z.infer<typeof VolumesResponseApiSchema>
