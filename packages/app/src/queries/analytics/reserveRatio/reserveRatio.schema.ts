import { ReserveRatioEntryApiSchema } from "@open-djed/api"
import z from "zod"

/**
 * Transformed schema to convert string values to numbers for easier usage in the app
 */
export const ReserveRatioEntrySchema = ReserveRatioEntryApiSchema.transform(
  (entry) => ({
    ...entry,
    reserveRatio: Number(entry.reserveRatio),
  }),
)

export const ReserveRatioResponseSchema = z.array(ReserveRatioEntrySchema)
export type ReserveRatioEntry = z.infer<typeof ReserveRatioEntrySchema>
export type ReserveRatioResponse = z.infer<typeof ReserveRatioResponseSchema>
