import { z } from "zod"

/**
 * Schemas for ReserveRatio API response.
 */
export const ReserveRatioEntryApiSchema = z.object({
  id: z.number(),
  timestamp: z.coerce.string(),
  reserveRatio: z.coerce.string(),
})

export const ReserveRatioResponseApiSchema = z.array(ReserveRatioEntryApiSchema)
export type ReserveRatioEntryApi = z.infer<typeof ReserveRatioEntryApiSchema>
export type ReserveRatioResponseApi = z.infer<
  typeof ReserveRatioResponseApiSchema
>
