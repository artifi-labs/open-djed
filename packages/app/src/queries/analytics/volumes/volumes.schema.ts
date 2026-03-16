import { z } from "zod"

/**
 * Schemas for Volumes API response.
 */
export const VolumesEntryApiSchema = z.object({
  timestamp: z.string(),
  djedMintedUSD: z.string(),
  shenMintedUSD: z.string(),
  djedBurnedUSD: z.string(),
  shenBurnedUSD: z.string(),
  djedMintedADA: z.string(),
  djedBurnedADA: z.string(),
  shenMintedADA: z.string(),
  shenBurnedADA: z.string(),
  totalDjedVolumeUSD: z.string(),
  totalShenVolumeUSD: z.string(),
  totalDjedVolumeADA: z.string(),
  totalShenVolumeADA: z.string(),
  totalVolumeUSD: z.string(),
  totalVolumeADA: z.string(),
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
