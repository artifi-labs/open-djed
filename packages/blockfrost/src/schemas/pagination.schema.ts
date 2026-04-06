import { z } from "zod"

export const PaginationSchema = z.object({
  page: z.number().optional(),
  count: z.number().optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

export type Pagination = z.infer<typeof PaginationSchema>
