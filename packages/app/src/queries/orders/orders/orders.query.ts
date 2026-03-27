import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import { ordersKeys } from "@/queries/orders/keys"
import {
  type OrdersBody,
  type OrdersQueryParams,
  ordersResponseSchema,
} from "@open-djed/api"

type Params = {
  body: OrdersBody
  queryParams?: OrdersQueryParams
}

export function useOrdersQuery({ body, queryParams }: Params) {
  const client = useApiClient()

  return useQuery({
    queryKey: ordersKeys.orders(body, queryParams),

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
