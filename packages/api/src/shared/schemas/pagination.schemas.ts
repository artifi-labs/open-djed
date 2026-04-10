import { z } from '@hono/zod-openapi'

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      currentPage: z.number().openapi({ example: 1 }),
      hasNextPage: z.boolean().openapi({ example: true }),
      hasPreviousPage: z.boolean().openapi({ example: false }),
      ordersPerPage: z.number().openapi({ example: 10 }),
      totalOrders: z.number().openapi({ example: 100 }),
      totalPages: z.number().openapi({ example: 10 }),
    }),
  })

export const paginationQueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(1),
})
