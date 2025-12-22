"use client"
import * as React from "react"
import OrderHistory from "@/components/new-components/OrderHistory"
import Button from "@/components/new-components/Button"
import SearchInput from "@/components/new-components/input-fields/SearchInput"
import Chip from "@/components/new-components/Chip"
// import ButtonIcon from "@/components/new-components/ButtonIcon"
import { useWallet } from "@/context/WalletContext"
import { useSidebar } from "@/context/SidebarContext"
import type { Pagination, StatusFilters } from "@/hooks/useOrders"
import { statusFiltersArray, useOrders } from "@/hooks/useOrders"
import BaseCard from "@/components/new-components/card/BaseCard"
import { useEffect, useMemo, useState } from "react"
import { ORDERS_PER_PAGE } from "@/lib/constants"

export default function OrderPage() {
  const { wallet } = useWallet()
  const { openWalletSidebar } = useSidebar()
  const [selectedFilter, setSelectedFilter] = useState<StatusFilters>("All")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination>()
  const { orders, fetchOrders } = useOrders()

  useEffect(() => {
    fetchOrders(page, ORDERS_PER_PAGE)
      .then((paginationData) => {
        if (paginationData) {
          setPagination(paginationData)
        }
      })
      .catch((e) => console.error(e))
  }, [wallet, page])

  const filteredOrders = useMemo(() => {
    if (selectedFilter === "All") {
      return orders
    }
    return orders.filter((order) => order.status === selectedFilter)
  }, [orders, selectedFilter])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="desktop:pt-32 desktop:pb-64 mx-auto flex w-full max-w-280 flex-1 flex-col">
      {!wallet ? (
        <BaseCard
          border="border-gradient border-color-primary"
          className="justify-center p-16"
        >
          <div className="flex flex-col items-center justify-center gap-24 text-center">
            {/* TITLE & DESCRIPTION */}
            <div className="flex flex-col gap-6">
              <p className="text-lg font-semibold">No orders to display yet.</p>

              <p className="text-sm">
                Once the wallet is connected and activity starts, orders will
                appear here
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
          <div className="flex flex-row justify-start gap-8 py-18">
            {/* Search */}
            <div className="flex items-center">
              <SearchInput
                id="search-input"
                placeholder="Search"
                size="Small"
              />
            </div>

            {/* Calendar */}
            {/*{<div className="flex w-fit items-center">
              <ButtonIcon variant="secondary" size="small" icon="Calendar" />
            </div>}*/}

            {/* Filters */}
            <div className="flex w-full flex-row justify-end gap-8">
              {statusFiltersArray.map((status) => (
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
          </div>

          {/* Table */}
          <OrderHistory
            data={filteredOrders}
            filters={selectedFilter !== "All" && orders.length > 0}
            totalCount={pagination?.totalOrders}
            currentPage={page}
            onPageChange={handlePageChange}
            serverSidePagination={true}
          />
        </>
      )}
    </div>
  )
}
