"use client"

import * as React from "react"
import { useMemo } from "react"
import Link from "next/link"
import Table from "../table/Table"
import Button from "../Button"
import Coin from "../Coin"
import Divider from "../Divider"
import ButtonIcon from "../ButtonIcon"
import type { IconCoinName } from "../Coin"
import type { HeaderItem } from "../table/Table"
import Tag from "../Tag"
import Dialog from "../Dialog"
import Snackbar from "../Snackbar"
import TransactionDetails from "../TransactionDetails"
import { type OrderStatus, useOrders } from "@/hooks/useOrders"

import BaseCard from "../card/BaseCard"
import { useViewport } from "@/hooks/useViewport"
import Asset from "../Asset"
import { CARDANOSCAN_BASE_URL, ORDERS_PER_PAGE } from "@/lib/constants"
import type { Order } from "@open-djed/api"
import { useTranslations } from "next-intl"
import { capitalize } from "@/lib/utils"

interface RowItem {
  columns: { content: React.ReactNode }[]
  key: string
  raw: Order
}

interface OrderHistoryProps {
  data: Order[]
  filters: boolean
  totalCount?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  serverSidePagination?: boolean
  handleClearFilters?: () => void
  totalPages?: number
}

export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    type: "success" | "warning" | "error" | "surface"
    text: string
    i18nKey: string
  }
> = {
  // Processing: { type: "surface", text: "Processing" },
  Created: {
    type: "surface",
    text: "Created",
    i18nKey: "orders.status.created",
  },
  Completed: {
    type: "success",
    text: "Completed",
    i18nKey: "orders.status.completed",
  },
  Rejected: {
    type: "error",
    text: "Rejected",
    i18nKey: "orders.status.rejected",
  },
  // Cancelling: { type: "warning", text: "Cancelling" },
  Canceled: {
    type: "surface",
    text: "Canceled",
    i18nKey: "orders.status.canceled",
  },
  // Failed: { type: "error", text: "Failed" },
  // Expired: { type: "error", text: "Expired" },
}

const formatAda = (value?: bigint | null) => {
  if (!value) return "-"
  return (Number(value) / 1e6).toLocaleString()
}

const shouldShowAda = (
  token: string | undefined,
  action: string | undefined,
  type: "paid" | "received",
): boolean => {
  if (token === "BOTH" || !action) return false
  const isMint = action === "Mint"
  return (isMint && type === "paid") || (!isMint && type === "received")
}

const renderValueDisplay = (
  value: bigint | null | undefined,
  showAda: boolean,
) => {
  const adaValue = formatAda(value)
  if (showAda) {
    return (
      <div className="flex items-center gap-2 px-16 py-12">
        <span>{adaValue}</span>
        <span>ADA</span>
      </div>
    )
  }
  /* For BOTH tokens showing DJED + SHEN */
  return (
    <div className="flex items-center gap-8 px-16 py-12">
      <div className="flex items-center gap-2">
        <span>{adaValue}</span>
        <span>DJED</span>
      </div>

      <Divider orientation="vertical" />

      <div className="flex items-center gap-2">
        <span>{adaValue}</span>
        <span>SHEN</span>
      </div>
    </div>
  )
}

const TokenCell = ({ token }: { token: string }) => {
  if (token === "BOTH") {
    return (
      <div className="flex items-center gap-8 px-16 py-12">
        <div className="flex items-center gap-8">
          <Coin name="SHEN" size="small" checked={false} />
          <span>SHEN</span>
        </div>

        <Divider orientation="vertical" />

        <div className="flex items-center gap-8">
          <Coin name="DJED" size="small" checked={false} />
          <span>DJED</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-8 px-16 py-12">
      <Coin name={token as IconCoinName} size="small" checked={false} />
      <span>{token}</span>
    </div>
  )
}

const TypeCell = ({ action }: { action: string }) => (
  <div className="px-16 py-12">
    <span>{action}</span>
  </div>
)

const DateCell = ({ date }: { date: string | Date }) => {
  const { formatDate } = useOrders()
  const timestamp =
    typeof date === "string" ? new Date(date).getTime() : date.getTime()

  return (
    <div className="px-16 py-12 text-nowrap">
      <span>{formatDate(BigInt(timestamp))}</span>
    </div>
  )
}

const ValueCell = ({
  value,
  token,
  action,
  type,
}: {
  value?: bigint | null
  token?: "DJED" | "SHEN" | "BOTH"
  action?: "Mint" | "Burn"
  type: "paid" | "received"
}) => {
  if (!value) return <span>-</span>

  const showAda = shouldShowAda(token, action, type)

  if (token === "BOTH" && action) {
    return renderValueDisplay(value, showAda)
  }

  /* Single token */
  return (
    <div className="flex items-center gap-2 px-16 py-12">
      <span>{formatAda(value)}</span>
      <span>{showAda ? "ADA" : token}</span>
    </div>
  )
}

const StatusCell = ({ status }: { status?: string | null }) => {
  const t = useTranslations()

  if (!status) return <span>-</span>

  const config = STATUS_CONFIG[status as OrderStatus]

  if (!config) return <span>{status}</span>

  return (
    <div className="px-16 py-12">
      <Tag
        type={config.type}
        role="Secondary"
        size="small"
        text={t(config.i18nKey)}
      />
    </div>
  )
}

const ExternalCell = ({
  txHash,
  status,
  outIndex,
}: {
  txHash: string
  status?: string
  outIndex: number
}) => {
  const t = useTranslations()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [showSnackbar, setShowSnackbar] = React.useState(false)
  const { handleCancelOrder } = useOrders()

  const showCancel = status === "Created"

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  React.useEffect(() => {
    if (!showSnackbar) return

    const time = setTimeout(() => setShowSnackbar(false), 4000)
    return () => clearTimeout(time)
  }, [showSnackbar])

  return (
    <div className="flex justify-end gap-8">
      {showCancel && (
        <>
          <Button
            text={t("orders.cancel")}
            variant="secondary"
            size="small"
            onClick={() => setIsDialogOpen(true)}
          />

          {isDialogOpen && (
            <Dialog
              title={t("orders.confirmCancellation")}
              description={t("orders.cancellationDescription")}
              type="Info"
              hasActions
              hasIcon
              hasPrimaryButton
              primaryButtonVariant="destructive"
              primaryButtonLabel={t("orders.cancelOrder")}
              hasSecondaryButton
              secondaryButtonLabel={t("orders.dismiss")}
              hasSkrim={true}
              onSecondaryButtonClick={handleCloseDialog}
              onPrimaryButtonClick={() => {
                handleCancelOrder(txHash, outIndex).catch(console.error)
                setIsDialogOpen(false)
              }}
            />
          )}
        </>
      )}
      <Link
        href={`${CARDANOSCAN_BASE_URL}/transaction/${txHash}`}
        target="_blank"
      >
        <ButtonIcon size="small" variant="outlined" icon="External" />
      </Link>

      {showSnackbar && (
        <div className="fixed right-24 bottom-24 z-50">
          <Snackbar
            text={t("orders.orderCanceled")}
            type="success"
            closeIcon={true}
            leadingIcon="Checkmark"
            action={false}
            onCloseClick={() => setShowSnackbar(false)}
          />
        </div>
      )}
    </div>
  )
}

const MobileCell = ({ order }: { order: Order }) => {
  const t = useTranslations()
  const { handleCancelOrder, formatDate } = useOrders()

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const showCancel = order.status === "Created"

  const showAdaPaid = shouldShowAda(order.token, order.action, "paid")
  const showAdaReceived = shouldShowAda(order.token, order.action, "received")

  const statusConfig = STATUS_CONFIG[order.status as OrderStatus]

  return (
    <>
      <div className="flex w-full flex-col gap-16 p-8">
        <div className="flex flex-row items-center justify-between">
          <Asset coin={order.token} size="small" checked={false} />
        </div>
        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-row items-center justify-between">
            <span className="text-tertiary text-xxs">
              {capitalize(t("orders.table.header.type"))}
            </span>
            <span className="text-xs">{order.action}</span>
          </div>
          <div className="flex w-full flex-row items-center justify-between">
            <span className="text-tertiary text-xxs">
              {capitalize(t("orders.table.header.date"))}
            </span>
            <span className="text-xs">
              {formatDate(BigInt(new Date(order.orderDate).getTime()))}
            </span>
          </div>
          <div className="flex w-full flex-row items-center justify-between">
            <span className="text-tertiary text-xxs">
              {capitalize(t("orders.table.header.paid"))}
            </span>
            <div className="flex items-center gap-2">
              <span>{formatAda(order.paid)}</span>
              <span>{showAdaPaid ? "ADA" : order.token}</span>
            </div>
          </div>
          <div className="flex w-full flex-row items-center justify-between">
            <span className="text-tertiary text-xxs">
              {capitalize(t("orders.table.header.received"))}
            </span>
            <div className="flex items-center gap-2">
              <span>{formatAda(order.received)}</span>
              <span>{showAdaReceived ? "ADA" : order.token}</span>
            </div>
          </div>
          <div className="flex w-full flex-row items-center justify-between">
            <span className="text-tertiary text-xxs">
              {capitalize(t("orders.table.header.status"))}
            </span>
            <Tag
              type={statusConfig.type}
              role="Secondary"
              size="small"
              text={t(statusConfig.i18nKey)}
            />
          </div>
          {showCancel ? (
            <div className="grid grid-cols-2 gap-8">
              <Button
                text={t("orders.cancel")}
                variant="secondary"
                size="small"
                onClick={() => setIsDialogOpen(true)}
              />
              <Link
                href={`${CARDANOSCAN_BASE_URL}/transaction/${order.tx_hash}`}
                target="_blank"
              >
                <Button
                  text={t("orders.viewTransaction")}
                  variant="secondary"
                  size="small"
                  className="w-full"
                />
              </Link>
            </div>
          ) : (
            <Link
              href={`${CARDANOSCAN_BASE_URL}/transaction/${order.tx_hash}`}
              target="_blank"
            >
              <Button
                text={t("orders.viewTransaction")}
                variant="secondary"
                size="small"
                className="w-full"
              />
            </Link>
          )}
        </div>
      </div>
      {isDialogOpen && (
        <Dialog
          title={t("orders.confirmCancellation")}
          description={t("orders.cancellationDescription")}
          type="Info"
          hasActions
          hasIcon
          hasPrimaryButton
          primaryButtonVariant="destructive"
          primaryButtonLabel={t("orders.cancelOrder")}
          hasSecondaryButton
          secondaryButtonLabel={t("orders.dismiss")}
          hasSkrim={true}
          onSecondaryButtonClick={() => setIsDialogOpen(false)}
          onPrimaryButtonClick={() => {
            handleCancelOrder(order.tx_hash, order.out_index).catch(
              console.error,
            )
            setIsDialogOpen(false)
          }}
        />
      )}
    </>
  )
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  data,
  filters,
  handleClearFilters,
  totalCount,
  currentPage,
  onPageChange,
  serverSidePagination = false,
  totalPages = 0,
}) => {
  const t = useTranslations()
  const { isMobile } = useViewport()

  const rowsDesktop: RowItem[] = useMemo(() => {
    if (!data.length || isMobile) return []
    return data.map((order) => ({
      key: order.tx_hash,
      raw: order,
      columns: [
        { content: <TokenCell token={order.token} /> },
        {
          content: (
            <TypeCell action={t(`action.${order.action.toLowerCase()}`)} />
          ),
        },
        { content: <DateCell date={order.orderDate} /> },
        {
          content: (
            <ValueCell
              value={order.paid}
              token={order.token}
              action={order.action}
              type="paid"
            />
          ),
        },
        {
          content: (
            <ValueCell
              value={order.received}
              token={order.token}
              action={order.action}
              type="received"
            />
          ),
        },
        {
          content: (
            <StatusCell
              status={t(`orders.status.${order.status?.toLowerCase()}`)}
            />
          ),
        },
        {
          content: (
            <ExternalCell
              txHash={order.tx_hash}
              status={order.status ?? ""}
              outIndex={order.out_index}
            />
          ),
        },
      ],
    }))
  }, [data, isMobile])

  const rowsMobile: RowItem[] = useMemo(() => {
    if (!data.length || !isMobile) return []
    return data.map((order) => ({
      key: order.tx_hash,
      raw: order,
      columns: [{ content: <MobileCell order={order} /> }],
    }))
  }, [data, isMobile])

  const headersDesktop: HeaderItem[] = [
    {
      column: t("orders.table.header.token"),
      columnKey: "token",
      size: "medium",
      sortable: true,
    },
    {
      column: t("orders.table.header.type"),
      columnKey: "type",
      size: "medium",
      sortable: true,
    },
    {
      column: t("orders.table.header.date"),
      columnKey: "date",
      size: "medium",
      sortable: true,
    },
    {
      column: t("orders.table.header.paid"),
      columnKey: "paid",
      size: "medium",
    },
    {
      column: t("orders.table.header.received"),
      columnKey: "received",
      size: "medium",
    },
    {
      column: t("orders.table.header.status"),
      columnKey: "status",
      size: "medium",
    },
    {
      column: undefined,
      columnKey: "actions",
      size: "small",
    },
  ]

  const headersMobile: HeaderItem[] = [
    {
      column: t("orders.table.header.orders"),
      columnKey: "orders",
      size: "auto",
      sortable: false,
    },
  ]

  if (!data.length) {
    return (
      <BaseCard
        border="border-gradient border-color-primary"
        className="justify-center p-16"
      >
        <div className="flex flex-col items-center justify-center gap-24 text-center">
          {/* TITLE & DESCRIPTION */}
          <div className="flex flex-col gap-6">
            <p className="text-lg font-semibold">
              {filters
                ? t("orders.noOrdersMatchFilters")
                : t("orders.noOrdersToDisplay")}
            </p>

            <p className="text-sm">
              {filters
                ? t("orders.tryAdjustingFilters")
                : t("orders.ordersWillAppear")}
            </p>
          </div>

          {filters ? (
            <Button
              text={t("orders.table.filters.clearAll")}
              variant="secondary"
              size="small"
              onClick={handleClearFilters}
            />
          ) : (
            <Link href={"/"}>
              <Button
                text={t("common.mintAndBurnNow")}
                variant="accent"
                size="small"
              />
            </Link>
          )}
        </div>
      </BaseCard>
    )
  }

  return (
    <Table
      totalPages={totalPages}
      headers={isMobile ? headersMobile : headersDesktop}
      rows={isMobile ? rowsMobile : rowsDesktop}
      rowsPerPage={ORDERS_PER_PAGE}
      totalCount={totalCount ?? data.length}
      currentPage={currentPage}
      onPageChange={onPageChange}
      serverSidePagination={serverSidePagination}
      RowComponent={TransactionDetails}
    />
  )
}

export default OrderHistory
