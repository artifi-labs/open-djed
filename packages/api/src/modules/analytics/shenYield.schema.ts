import z from "zod"

/**
 * Schemas for SHEN yield API responses.
 */
export const ShenYieldEntryApiSchema = z.object({
  timestamp: z.string(),
  yield: z.string(),
})

export const ShenYieldResponseApiSchema = z.array(ShenYieldEntryApiSchema)
export type ShenYieldEntryApi = z.infer<typeof ShenYieldEntryApiSchema>
export type ShenYieldResponseApi = z.infer<typeof ShenYieldResponseApiSchema>
