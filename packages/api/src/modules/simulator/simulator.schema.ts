import z from "zod"

export const DateRangeSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
})
