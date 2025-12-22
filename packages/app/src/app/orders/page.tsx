"use client"
import * as React from "react"
import OrderHistory from "@/components/new-components/OrderHistory"
import SearchInput from "@/components/new-components/input-fields/SearchInput"
import Chip from "@/components/new-components/Chip"
import ButtonIcon from "@/components/new-components/ButtonIcon"
import Button from "@/components/new-components/Button"
import { useWallet } from "@/context/WalletContext"
import { useSidebar } from "@/context/SidebarContext"
import {
  Pagination,
  StatusFilters,
  statusFiltersArray,
  useOrders,
} from "@/hooks/useOrders"
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
    <div className="desktop:pt-32 desktop:pb-64 mx-auto w-full max-w-280">
      {!wallet ? (
        <div className="bg-surface-card border-border-primary rounded-8 mb-36 flex min-h-screen w-full flex-col items-center justify-center gap-6 border">
          <span className="text-lg font-semibold">
            No orders to display yet.
          </span>
          <span className="mb-24 text-center text-sm text-nowrap">
            Once the wallet is connected and activity starts, orders will appear
            here
          </span>
          <Button
            text="Connect wallet"
            variant="accent"
            size="small"
            onClick={() => openWalletSidebar()}
          />
        </div>
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
            <div className="flex w-fit items-center">
              <ButtonIcon variant="secondary" size="small" icon="Calendar" />
            </div>
            {/* Filters */}
            <div className="flex w-full flex-row justify-start gap-8">
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
