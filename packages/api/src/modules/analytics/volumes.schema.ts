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

/**
 * Transformed schema to convert string values to numbers for easier usage in the app
 */
export const VolumesEntrySchema = VolumesEntryApiSchema.transform((entry) => ({
  ...entry,
  djedMintedUSD: Number(entry.djedMintedUSD),
  shenMintedUSD: Number(entry.shenMintedUSD),
  djedBurnedUSD: Number(entry.djedBurnedUSD),
  shenBurnedUSD: Number(entry.shenBurnedUSD),
  djedMintedADA: Number(entry.djedMintedADA),
  djedBurnedADA: Number(entry.djedBurnedADA),
  shenMintedADA: Number(entry.shenMintedADA),
  shenBurnedADA: Number(entry.shenBurnedADA),
  totalDjedVolumeUSD: Number(entry.totalDjedVolumeUSD),
  totalShenVolumeUSD: Number(entry.totalShenVolumeUSD),
  totalDjedVolumeADA: Number(entry.totalDjedVolumeADA),
  totalShenVolumeADA: Number(entry.totalShenVolumeADA),
  totalVolumeUSD: Number(entry.totalVolumeUSD),
  totalVolumeADA: Number(entry.totalVolumeADA),
}))

export const VolumesResponseSchema = z.array(VolumesEntrySchema)
export type VolumesEntry = z.infer<typeof VolumesEntrySchema>
export type VolumesResponse = z.infer<typeof VolumesResponseSchema>
