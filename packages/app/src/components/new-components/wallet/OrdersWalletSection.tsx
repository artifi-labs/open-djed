"use client"
import { useEffect, useState } from "react"
import type { OrderUTxO } from "@open-djed/txs"
import { useApiClient } from "@/context/ApiClientContext"
import type { Wallet } from "@/context/WalletContext"
import WalletOrder from "./WalletOrder"
import Button from "../Button"
import Link from "next/link"
import { useSidebar } from "@/context/SidebarContext"
import JSONBig from "json-bigint"

export default function OrdersWalletSection({ wallet }: { wallet: Wallet }) {
  const { closeSidebar } = useSidebar()
  const [orders, setOrders] = useState<OrderUTxO[]>([])

  const client = useApiClient()

  useEffect(() => {
    if (!wallet) return

    const fetchOrders = async () => {
      const usedAddress = await wallet.getUsedAddresses()
      if (!usedAddress) throw new Error("Failed to get used address")

      try {
        const res = await client.api.orders.$post({
          json: { usedAddresses: usedAddress },
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.text()
        const parsed = JSONBig.parse(data)
        setOrders(parsed.orders)
      } catch (err) {
        console.error("Error fetching orders:", err)
      }
    }

    fetchOrders().catch(console.error)
  }, [wallet])

  return (
    <>
      <div className="flex h-full w-full flex-col gap-6 px-12 py-8">
        <h1 className="text-sm font-medium">Orders</h1>
        <div className="flex h-full w-full flex-col gap-12">
          {orders.length > 0 ? (
            <>
              {orders.map((order, index) => {
                return (
                  <WalletOrder
                    order={order}
                    wallet={wallet}
                    key={order.txHash}
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
