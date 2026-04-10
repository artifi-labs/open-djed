import z from "zod"

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      currentPage: z.number(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
      ordersPerPage: z.number(),
      totalOrders: z.number(),
      totalPages: z.number(),
    }),
  })

export const paginationQueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(1),
})
