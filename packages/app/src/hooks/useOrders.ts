import { useApiClient } from "@/context/ApiClientContext"
import { useToast } from "@/context/ToastContext"
import { useWallet } from "@/context/WalletContext"
import { useState, useCallback } from "react"
import JSONBig from "json-bigint"
import { getWalletData } from "@/lib/getWalletData"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import { AppError } from "@open-djed/api/src/errors"
import type { Order } from "@open-djed/api"

// this value will be retrieve from the db package when integrated
export type OrderApi = {
  id: number
  tx_hash: string
  action: "Mint" | "Burn"
  token: "DJED" | "SHEN" | "BOTH"
  orderDate: string
  paid?: bigint | null
  fees?: bigint | null
  received?: bigint | null
  status?: OrderStatus
  address: {
    paymentKeyHash: string[]
    stakeKeyHash: string[][][]
  }
}

export type OrderStatus =
  // | "Processing"
  | "Created"
  | "Completed"
  // | "Cancelling"
  | "Canceled"
// | "Failed"
// | "Expired"

export const statusFiltersArray = [
  "All",
  // "Processing",
  "Created",
  "Completed",
  // "Cancelling",
  "Canceled",
  // "Failed",
  // "Expired",
] as const

// derive the type from the filters array
export type StatusFilters = (typeof statusFiltersArray)[number]

export type Pagination = {
  currentPage: number
  totalPages: number
  totalOrders: number
  ordersPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

function formatRelativeDate(timestampMs: bigint): string {
  const date = new Date(Number(timestampMs))
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  // if date is less than 1 hour ago → "X min(s) ago"
  if (diffMinutes < 60) {
    if (diffMinutes <= 1) return "1 min ago"
    return `${diffMinutes} mins ago`
  }

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((nowDay.getTime() - dateDay.getTime()) / 86400000)

  // if date is today → "Today, 14:30"
  if (diffDays === 0) {
    return `Today, ${time}`
  }

  // if date was yesterday → "Yesterday, 21:30"
  if (diffDays === 1) {
    return `Yesterday, ${time}`
  }

  // if date is more than 48h ago → "12/02/2020"
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export const useOrders = () => {
  const apiClient = useApiClient()
  const { wallet } = useWallet()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])

  const fetchOrders = useCallback(
    async (page = 1, limit = 10, status: StatusFilters = "All") => {
      if (!wallet) return

      const usedAddress = await wallet.getUsedAddresses()
      if (!usedAddress) throw new Error("Failed to get used address")

      try {
        const res = await apiClient.api["historical-orders"].$post({
          json: { usedAddresses: usedAddress },
          query: {
            page: page.toString(),
            limit: limit.toString(),
            ...(status !== "All" && { status }),
          },
        })

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

        const data = await res.text()
        const parsed: {
          orders: Order[]
          pagination: Pagination
        } = JSONBig({ useNativeBigInt: true }).parse(data)

        setOrders(parsed.orders)
        return parsed.pagination
      } catch (err) {
        console.error("Error fetching orders:", err)
      }
    },
    [wallet, apiClient],
  )

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
        message: "Your order has been cancelled.",
        type: "success",
      })
    } catch (err) {
      console.error("Action failed:", err)
      if (err instanceof AppError) {
        console.error("AppError:", err.message)
        showToast({
          message: "Something went wrong while cancelling your order.",
          type: "error",
        })
      }
    }
  }

  return {
    orders,
    fetchOrders,
    formatDate: formatRelativeDate,
    handleCancelOrder,
  }
}
