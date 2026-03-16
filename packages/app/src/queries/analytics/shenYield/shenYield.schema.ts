import { z } from "zod"

/**
 * Schemas for SHEN yield API responses.
 */
export const ShenYieldEntryApiSchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  yield: z.string(),
})

export const ShenYieldResponseApiSchema = z.array(ShenYieldEntryApiSchema)
export type ShenYieldEntryApi = z.infer<typeof ShenYieldEntryApiSchema>
export type ShenYieldResponseApi = z.infer<typeof ShenYieldResponseApiSchema>

/**
 * Transformed schema to convert string values to numbers for easier usage in the app
 */
export const ShenYieldEntrySchema = ShenYieldEntryApiSchema.transform(
  (entry) => ({
    ...entry,
    yield: Number(entry.yield),
  }),
)

export const ShenYieldResponseSchema = z.array(ShenYieldEntrySchema)
export type ShenYieldEntry = z.infer<typeof ShenYieldEntrySchema>
export type ShenYieldResponse = z.infer<typeof ShenYieldResponseSchema>

export type ShenYieldChartEntry = ShenYieldEntry & {
  isProjected: boolean
}
