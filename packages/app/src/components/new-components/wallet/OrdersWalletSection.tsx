"use client"
import WalletOrder from "./WalletOrder"
import Button from "../Button"
import Link from "next/link"
import { useSidebar } from "@/context/SidebarContext"
import { useOrders } from "@/hooks/useOrders"
import { useEffect, useMemo } from "react"
import { type Wallet } from "@/context/WalletContext"

export default function OrdersWalletSection({ wallet }: { wallet: Wallet }) {
  const { closeSidebar } = useSidebar()
  const { orders, fetchOrders } = useOrders()

  useEffect(() => {
    fetchOrders().catch((e) => console.error(e))
  }, [wallet])

  const lastFiveOrders = useMemo(() => {
    return orders.slice(0, 4)
  }, [orders])

  return (
    <>
      <div className="flex h-full w-full flex-col gap-6 overflow-y-auto px-12 py-8">
        <h1 className="text-sm font-medium">Orders</h1>
        <div className="flex h-full w-full flex-col gap-12">
          {lastFiveOrders.length > 0 ? (
            <>
              {lastFiveOrders.map((order, index) => {
                return (
                  <WalletOrder
                    order={order}
                    key={order.tx_hash}
                    divider={index !== orders.length - 1}
                  />
                )
              })}
              <Link href={"/orders"} className="w-full">
                <Button
                  text={"All orders"}
                  className="w-full"
                  variant="secondary"
                  onClick={() => closeSidebar()}
                />
              </Link>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-12">
              <div className="flex w-full flex-col items-center justify-center">
                <span className="text-sm font-semibold md:text-base">
                  No orders yet
                </span>
                <span className="text-center text-xs md:text-sm">
                  Looks like this wallet hasn't made any trades.
                </span>
              </div>
              <Link href={"/"} className="w-full">
                <Button
                  text={"Mint & Burn Now"}
                  className="w-full"
                  variant="secondary"
                  onClick={() => closeSidebar()}
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
