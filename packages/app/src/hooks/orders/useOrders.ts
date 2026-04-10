import { useWallet } from "@/context/WalletContext"
import { useState } from "react"
import { useOrdersQuery } from "@/queries/orders/orders/orders.query"
import { useQuery } from "@tanstack/react-query"
import { type OrdersQueryParams, type OrderStatus } from "@open-djed/api"

type UseOrdersParams = {
  queryParams?: Partial<OrdersQueryParams>
}

export const useOrders = ({ queryParams }: UseOrdersParams = {}) => {
  const { wallet } = useWallet()
  const [params, setParams] = useState<OrdersQueryParams>({
    page: queryParams?.page ?? 1,
    limit: queryParams?.limit ?? 10,
    status: queryParams?.status,
  })

  const { data: usedAddresses = [] } = useQuery({
    queryKey: ["usedAddresses"],
    queryFn: () => wallet?.getUsedAddresses(),
    enabled: !!wallet,
  })

  const hasAddresses = usedAddresses.length > 0

  const { data, isLoading, isError, error, refetch } = useOrdersQuery({
    body: {
      usedAddresses,
    },
    queryParams: params,
    options: { enabled: hasAddresses },
  })

  const setFilterStatus = (value: OrderStatus[] | undefined) => {
    setParams((prev) => ({ ...prev, status: value, page: 1 }))
  }

  const nextPage = () => {
    if (data?.pagination?.hasNextPage) {
      setParams((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
    }
  }

  const prevPage = () => {
    setParams((prev) => ({ ...prev, page: Math.max(1, (prev.page ?? 1) - 1) }))
  }

  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }

  return {
    // data
    orders: data?.data ?? [],
    pagination: data?.pagination,

    //state
    page: params.page,
    limit: params.limit,
    status: params.status,

    //loading
    isLoading: isLoading,

    // error
    isError,
    errorMessage: error?.message,

    //filters
    setFilterStatus,

    // pagination
    setPage,
    nextPage,
    prevPage,

    // react-query
    refetch: refetch,
  }
}
