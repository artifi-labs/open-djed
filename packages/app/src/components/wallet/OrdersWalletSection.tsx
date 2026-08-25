"use client"
import WalletOrder from "./WalletOrder"
import Button from "../Button"
import { Link } from "@/i18n/navigation"
import { useSidebar } from "@/context/SidebarContext"
import { useOrders } from "@/hooks/orders/useOrders"
import { useTranslations } from "next-intl"
import { MAX_ORDERS_SIDEBAR } from "@/lib/constants"

function OrdersWalletSection() {
  const t = useTranslations()
  const { closeSidebar } = useSidebar()
  const orders = useOrders({ queryParams: { limit: MAX_ORDERS_SIDEBAR } })

  return (
    <>
      <div className="flex h-full w-full flex-col gap-12 overflow-y-auto py-8">
        <h2 className="text-sm font-medium">{t("orders.title")}</h2>
        <div className="flex h-full w-full flex-col gap-12">
          {orders.data.length > 0 ? (
            <>
              {orders.data.map((order, index) => {
                return (
                  <WalletOrder
                    order={order}
                    key={order.tx_hash}
                    divider={index !== orders.data.length - 1}
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
