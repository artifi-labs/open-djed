import { z } from "zod"

export const reserveRatioEntrySchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  reserveRatio: z.string(),
})

export const reserveRatioResponseSchema = z.array(reserveRatioEntrySchema)
