import { useApiClient } from "@/context/ApiClientContext"
import { useToast } from "@/context/ToastContext"
import { useWallet } from "@/context/WalletContext"
import { useState } from "react"
import { getWalletData } from "@/lib/getWalletData"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import { useOrdersQuery } from "@/queries/orders/orders/orders.query"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { AppError, type OrderStatus } from "@open-djed/api"

export const useOrders = () => {
  const t = useTranslations()
  const apiClient = useApiClient()
  const { wallet } = useWallet()
  const { showToast } = useToast()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [status, setStatus] = useState<OrderStatus[] | undefined>(undefined)

  const { data: usedAddresses = [] } = useQuery({
    queryKey: ["usedAddresses"],
    queryFn: () => wallet?.getUsedAddresses(),
    enabled: !!wallet,
  })

  const ordersQuery = useOrdersQuery({
    body: {
      usedAddresses,
    },
    queryParams: {
      page,
      limit,
      status,
    },
  })
  
  // TODO: REMOVE THIS from here
  const handleCancelOrder = async (orderTx: string, outIndex: number) => {
    const { Transaction, TransactionWitnessSet } =
      await import("@dcspark/cardano-multiplatform-lib-browser")
    if (!wallet) return
    try {
      const { address, utxos } = await getWalletData(wallet)
      const response = await apiClient.api["cancel-order"].$post({
        json: {
          hexAddress: address,
          utxosCborHex: utxos,
          txHash: orderTx,
          outIndex,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new AppError(errorData.message)
      }
      const txCbor = await response.text()
      await signAndSubmitTx(wallet, txCbor, Transaction, TransactionWitnessSet)

      showToast({
        message: t("orders.cancel.success"),
        type: "success",
      })
    } catch (err) {
      console.error("Action failed:", err)
      if (err instanceof AppError) {
        console.error("AppError:", err.message)
        showToast({
          message: t("orders.cancel.error"),
          type: "error",
        })
      }
    }
  }

  const setFilterStatus = (value: OrderStatus[] | undefined) => {
    setStatus(value)
    setPage(1)
  }

  const nextPage = () => {
    if (ordersQuery.data?.pagination?.hasNextPage) {
      setPage((p) => p + 1)
    }
  }

  const prevPage = () => {
    setPage((p) => Math.max(1, p - 1))
  }

  return {
    // data
    orders: ordersQuery.data?.data ?? [],
    pagination: ordersQuery.data?.pagination,
    //state
    page,
    limit,
    status,
    //loading
    isLoading: ordersQuery.isLoading,
    //filters 
    setFilterStatus,
    // pagination
    setPage,
    nextPage,
    prevPage,
    // actions
    handleCancelOrder,
    // utils
    //formatDate: formatRelativeDate, // TODO:DELETE THIS
    // react-query
    refetch: ordersQuery.refetch,
  }
}
