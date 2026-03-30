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
  page: z.number().optional(),
  limit: z.number().optional(),
})
