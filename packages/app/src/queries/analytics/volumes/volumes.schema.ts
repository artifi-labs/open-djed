import { VolumesEntryApiSchema } from "@open-djed/api"
import z from "zod"

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
