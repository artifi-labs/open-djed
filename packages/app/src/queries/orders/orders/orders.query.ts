import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import { ordersKeys } from "@/queries/orders/keys"
import { type OrdersBody, type OrdersQueryParams } from "@open-djed/api"
import {
  ordersResponseSchema,
  type OrdersResponse,
} from "@/queries/orders/orders/orders.schema"

type Params = {
  body: OrdersBody
  queryParams?: OrdersQueryParams
  options?: Omit<UseQueryOptions<OrdersResponse>, "queryKey" | "queryFn">
}

export function useOrdersQuery({ body, queryParams, options }: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: ordersKeys.orders(body, queryParams),
    ...options,

    queryFn: async () => {
      const res = await client.api["historical-orders"].$post({
        json: { usedAddresses: body.usedAddresses },
        query: {
          page: queryParams?.page?.toString(),
          limit: queryParams?.limit?.toString(),
          ...(queryParams?.status && { status: queryParams.status.join(",") }),
        },
      })

      if (!res.ok) throw new Error("Error fetching Orders")

      const json = await res.json()

      const parsed = ordersResponseSchema.parse(json)

      return parsed
    },
  })
}
