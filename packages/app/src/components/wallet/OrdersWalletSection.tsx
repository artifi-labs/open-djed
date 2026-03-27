"use client"
import WalletOrder from "./WalletOrder"
import Button from "../Button"
import Link from "next/link"
import { useSidebar } from "@/context/SidebarContext"
import { useOrders } from "@/hooks/orders/useOrders"
import { useTranslations } from "next-intl"

function OrdersWalletSection() {
  const t = useTranslations()
  const { closeSidebar } = useSidebar()
  const orders = useOrders()

  return (
    <>
      <div className="flex h-full w-full flex-col gap-12 overflow-y-auto py-8">
        <h1 className="text-sm font-medium">{t("orders.title")}</h1>
        <div className="flex h-full w-full flex-col gap-12">
          {orders.orders.length > 0 ? (
            <>
              {orders.orders.map((order, index) => {
                return (
                  <WalletOrder
                    order={order}
                    key={order.tx_hash}
                    divider={index !== orders.orders.length - 1}
                  />
                )
              })}
              <Link href={"/orders"} className="w-full">
                <Button
                  text={t("orders.allOrders")}
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
                  {t("orders.noOrders")}
                </span>
                <span className="text-center text-xs md:text-sm">
                  {t("orders.noOrdersDescription")}.
                </span>
              </div>
              <Link href={"/"} className="w-full">
                <Button
                  text={t("common.mintAndBurnNow")}
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

export default OrdersWalletSection