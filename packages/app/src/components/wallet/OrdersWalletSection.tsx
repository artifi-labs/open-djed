"use client"
import WalletOrder from "./WalletOrder"
import Button from "../Button"
import Link from "next/link"
import { useSidebar } from "@/context/SidebarContext"
import { useOrders } from "@/hooks/useOrders"
import { useEffect } from "react"
import { type Wallet } from "@/context/WalletContext"
import { ORDERS_SIDEBAR } from "@/lib/constants"

export default function OrdersWalletSection({ wallet }: { wallet: Wallet }) {
  const { closeSidebar } = useSidebar()
  const { orders, fetchOrders } = useOrders()

  useEffect(() => {
    fetchOrders(1, ORDERS_SIDEBAR).catch((e) => console.error(e))
  }, [wallet])

  return (
    <>
      <div className="flex h-full w-full flex-col gap-12 overflow-y-auto py-8">
        <h1 className="text-sm font-medium">Orders</h1>
        <div className="flex h-full w-full flex-col gap-12">
          {orders.length > 0 ? (
            <>
              {orders.map((order, index) => {
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
              <div className="flex w-full flex-col items-center justify-center gap-6">
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
                  variant="outlined"
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
