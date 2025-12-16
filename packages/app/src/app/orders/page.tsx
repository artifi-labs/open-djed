"use client"

import OrderHistory from "@/components/new-components/OrderHistory"
import SearchInput from "@/components/new-components/input-fields/SearchInput"
import Chip from "@/components/new-components/Chip"
import ButtonIcon from "@/components/new-components/ButtonIcon"
import Button from "@/components/new-components/Button"
import { useWallet } from "@/context/WalletContext"
import { useWalletSidebar } from "@/context/SidebarContext"

export type OrderApi = {
  id: number
  tx_hash: string
  action: "Mint" | "Burn"
  token: "DJED" | "SHEN" | "BOTH"
  orderDate: string
  paid?: bigint | null
  fees?: bigint | null
  received?: bigint | null
  status?:
    | "Processing"
    | "Completed"
    | "Cancelling"
    | "Canceled"
    | "Failed"
    | "Expired"
}

const STATUS_FILTERS = [
  "All",
  "Processing",
  "Completed",
  "Cancelling",
  "Canceled",
  "Failed",
  "Expired",
] as const

export default function OrderPage() {
  const { wallet } = useWallet()
  const { openWalletSidebar } = useWalletSidebar()

  const orders: OrderApi[] = [
    {
      id: 1,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Processing",
    },
    {
      id: 2,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Completed",
    },
    {
      id: 3,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Cancelling",
    },
    {
      id: 4,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Canceled",
    },
    {
      id: 5,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Failed",
    },
    {
      id: 6,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Expired",
    },
    {
      id: 1,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Processing",
    },
    {
      id: 2,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Completed",
    },
    {
      id: 3,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Cancelling",
    },
    {
      id: 4,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Canceled",
    },
    {
      id: 5,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Failed",
    },
    {
      id: 6,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Expired",
    },
    {
      id: 1,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Processing",
    },
    {
      id: 2,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Completed",
    },
    {
      id: 3,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Cancelling",
    },
    {
      id: 4,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Canceled",
    },
    {
      id: 5,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Failed",
    },
    {
      id: 6,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Expired",
    },
    {
      id: 1,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Processing",
    },
    {
      id: 2,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Completed",
    },
    {
      id: 3,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Cancelling",
    },
    {
      id: 4,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Canceled",
    },
    {
      id: 5,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Failed",
    },
    {
      id: 6,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Expired",
    },
    {
      id: 1,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Processing",
    },
    {
      id: 2,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Completed",
    },
    {
      id: 3,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Cancelling",
    },
    {
      id: 4,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Canceled",
    },
    {
      id: 5,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Failed",
    },
    {
      id: 6,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Expired",
    },
    {
      id: 1,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Processing",
    },
    {
      id: 2,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Completed",
    },
    {
      id: 3,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Cancelling",
    },
    {
      id: 4,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Canceled",
    },
    {
      id: 5,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Failed",
    },
    {
      id: 6,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Expired",
    },
    {
      id: 1,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Processing",
    },
    {
      id: 2,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Completed",
    },
    {
      id: 3,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Cancelling",
    },
    {
      id: 4,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Canceled",
    },
    {
      id: 5,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Failed",
    },
    {
      id: 6,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Expired",
    },
    {
      id: 1,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Processing",
    },
    {
      id: 2,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "DJED",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Completed",
    },
    {
      id: 3,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Cancelling",
    },
    {
      id: 4,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "SHEN",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Canceled",
    },
    {
      id: 5,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Burn",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Failed",
    },
    {
      id: 6,
      tx_hash:
        "17a81e15b52628768fe74d0efc04e004016e387b429a80998c4d15112a26e052",
      action: "Mint",
      token: "BOTH",
      orderDate: "2025-08-15T10:42:12.000Z",
      paid: BigInt(100000000),
      fees: BigInt(178965),
      received: BigInt(99821035),
      status: "Expired",
    },
  ]

  if (!wallet) {
    return (
      <div className="bg-surface-card flex min-h-screen w-full flex-col items-center justify-center gap-6">
        <span className="text-lg font-semibold">No orders to display yet.</span>

        <span className="mb-24 text-center text-sm text-nowrap">
          Once the wallet is connected and activity starts, orders will appear
          here
        </span>

        <Button
          text="Connect wallet"
          variant="accent"
          size="medium"
          onClick={() => openWalletSidebar()}
        />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-row py-18">
        {/* Search */}
        <div className="flex items-center gap-8 px-10 py-8">
          <SearchInput id="search-input" placeholder="Search" size="Small" />
        </div>

        {/* Calendar */}
        <div className="flex w-full items-center p-8">
          <ButtonIcon variant="secondary" size="small" icon="Calendar" />
        </div>

        {/* Status chips */}
        <div className="flex flex-row gap-8 px-14 py-6">
          {STATUS_FILTERS.map((status) => (
            <Chip key={status} text={status} size="small" variant="outlined" />
          ))}
        </div>
      </div>

      {/* Table */}
      <OrderHistory data={orders} />
    </div>
  )
}
