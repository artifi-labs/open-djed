import { z } from "zod"

/**
 * Schemas for ReserveRatio API response.
 */
export const ReserveRatioEntryApiSchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  reserveRatio: z.string(),
})

export const ReserveRatioResponseApiSchema = z.array(ReserveRatioEntryApiSchema)
export type ReserveRatioEntryApi = z.infer<typeof ReserveRatioEntryApiSchema>
export type ReserveRatioResponseApi = z.infer<
  typeof ReserveRatioResponseApiSchema
>

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
