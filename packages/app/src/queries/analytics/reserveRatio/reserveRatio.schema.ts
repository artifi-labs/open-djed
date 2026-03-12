import { z } from "zod"

export const ReserveRatioEntrySchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  reserveRatio: z.number(),
})

export const ReserveRatioResponseSchema = z.array(ReserveRatioEntrySchema)
export type ReserveRatioEntry = z.infer<typeof ReserveRatioEntrySchema>
export type ReserveRatioResponse = z.infer<typeof ReserveRatioResponseSchema>
