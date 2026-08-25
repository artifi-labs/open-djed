"use client"

import * as React from "react"
import OrderHistory from "@/components/order/OrderHistory"
import Button from "@/components/Button"
import { useWallet } from "@/context/WalletContext"
import { useSidebar } from "@/context/SidebarContext"
import { useOrders } from "@/hooks/orders/useOrders"
import BaseCard from "@/components/card/BaseCard"
import Chip from "@/components/Chip"
import { useTranslations } from "next-intl"
import { type OrderStatus } from "@open-djed/api"
import { type Type } from "@/components/Tag"
import { MAX_ORDERS_PER_PAGE } from "@/lib/constants"

const statusFilters: Array<{
  key: "All" | OrderStatus
  i18nKey: string
  type: Type
}> = [
  { key: "All", i18nKey: "orders.filters.status.all", type: "surface" },
  { key: "Created", i18nKey: "orders.filters.status.created", type: "success" },
  {
    key: "Completed",
    i18nKey: "orders.filters.status.completed",
    type: "error",
  },
  {
    key: "Canceled",
    i18nKey: "orders.filters.status.canceled",
    type: "surface",
  },
]

const Order = () => {
  const t = useTranslations()
  const { wallet } = useWallet()
  const { openWalletSidebar } = useSidebar()
  const orders = useOrders({ queryParams: { limit: MAX_ORDERS_PER_PAGE } })

  const toStatusFilter = (
    filter: "All" | OrderStatus,
  ): OrderStatus[] | undefined => (filter === "All" ? undefined : [filter])

  const hasOrders = orders.data.length > 0
  const hasActiveFilters = orders.status !== undefined

  return (
    <div className="desktop:pt-32 desktop:pb-64 mx-auto flex w-full max-w-280 flex-1 flex-col">
      {/* Header */}
      <div className="pb-16">
        <h1 className="text-h2 font-bold">{t("orders.title")}</h1>
      </div>

      {!wallet ? (
        <BaseCard
          border="border-gradient border-color-primary"
          className="justify-center p-16"
        >
          <div className="flex flex-col items-center justify-center gap-24 text-center">
            {/* TITLE & DESCRIPTION */}
            <div className="flex flex-col gap-6">
              <p className="text-lg font-semibold">{t("orders.noOrders")}</p>
              <p className="text-sm">{t("orders.noWalletDescription")}</p>
            </div>

            <Button
              text={t("wallet.connectWallet")}
              variant="accent"
              size="small"
              onClick={() => openWalletSidebar()}
            />
          </div>
        </BaseCard>
      ) : (
        <>
          {(hasOrders || hasActiveFilters) && (
            <div className="flex flex-row justify-start gap-8 py-18">
              {/* Filters */}
              <div className="flex w-full flex-row justify-start gap-8 sm:justify-end">
                {statusFilters.map((item) => (
                  <Chip
                    key={item.key}
                    text={t(item.i18nKey)}
                    size="small"
                    variant="outlined"
                    active={
                      item.key === "All"
                        ? orders.status === undefined
                        : orders.status?.includes(item.key as OrderStatus)
                    }
                    onClick={() =>
                      orders.setFilterStatus(toStatusFilter(item.key))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          <OrderHistory
            totalPages={orders.pagination?.totalPages}
            data={orders.data}
            filters={hasActiveFilters && hasOrders}
            totalCount={
              orders.pagination && orders.pagination.totalPages > 1
                ? orders.pagination.totalOrders
                : 0
            }
            currentPage={orders.page}
            onPageChange={orders.setPage}
            serverSidePagination={true}
            handleClearFilters={() => orders.setFilterStatus(undefined)}
          />
        </>
      )}
    </div>
  )
}
export default Order
