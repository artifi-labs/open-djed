import { ShenYieldEntryApiSchema } from "@open-djed/api"
import { z } from "zod"

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

// TODO: CHANGE THIS
export type ShenYieldChartEntry = ShenYieldEntry & {
  isProjected: boolean
}
