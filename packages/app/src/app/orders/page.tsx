"use client"

import * as React from "react"
import OrderHistory from "@/components/new-components/OrderHistory"
import Button from "@/components/new-components/Button"
import { useWallet } from "@/context/WalletContext"
import { useSidebar } from "@/context/SidebarContext"
import BaseCard from "@/components/new-components/card/BaseCard"

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
  const { openWalletSidebar } = useSidebar()
  const [selectedFilter, setSelectedFilter] = React.useState<string>("All")

  const allOrders: OrderApi[] = [
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

  const orders =
    selectedFilter === "All"
      ? allOrders
      : allOrders.filter((order) => order.status === selectedFilter)

  return (
    <div className="desktop:pt-32 desktop:pb-64 mx-auto w-full max-w-280 flex flex-col flex-1">
      {!wallet ? (
        <BaseCard
          border="border-gradient border-color-primary"
          className="justify-center p-16"
        >
          <div className="flex flex-col text-center items-center justify-center gap-24">
            {/* TITLE & DESCRIPTION */}
            <div className="flex flex-col gap-6">
              <p className="text-lg font-semibold">
                No orders to display yet.
              </p>

              <p className="text-sm">
                Once the wallet is connected and activity starts, orders will appear
                here
              </p>
            </div>

            <Button
              text="Connect wallet"
              variant="accent"
              size="small"
              onClick={() => openWalletSidebar()}
            />
          </div>
        </BaseCard>
      ) : (
        <>
          {/*<div className="flex flex-row gap-8 py-18">
            {/* Search */}
            {/*<div className="flex items-center">
              <SearchInput
                id="search-input"
                placeholder="Search"
                size="Small"
              />
            </div>
            */}

            {/* Calendar */}
            {/*<div className="flex w-full items-center">
              <ButtonIcon variant="secondary" size="small" icon="Calendar" />
            </div>*/}

            {/* Filters */}
            {/*<div className="flex flex-row gap-8">
              {STATUS_FILTERS.map((status) => (
                <Chip
                  key={status}
                  text={status}
                  size="small"
                  variant={"outlined"}
                  onClick={() => setSelectedFilter(status)}
                  active={selectedFilter === status}
                />
              ))}
            </div> 
          </div>*/}

          {/* Table */}
          <OrderHistory data={orders} />
        </>
      )}
    </div>
  )
}
