"use client"

import * as React from "react"
import { useMemo } from "react"
import Link from "next/link"
import { Skeleton } from "../Skeleton"
import Table from "./table/Table"
import Button from "./Button"
import Coin from "./Coin"
import Divider from "./Divider"
import ButtonIcon from "./ButtonIcon"
import type { IconCoinName } from "./Coin"
import type { OrderApi } from "@/app/orders/page"
import type { HeaderItem } from "./table/Table"
import Tag from "./Tag"
import Dialog from "./Dialog"
import Snackbar from "./Snackbar"
import TransactionDetails from "./TransactionDetails"

type OrderStatus =
  | "Processing"
  | "Completed"
  | "Cancelling"
  | "Canceled"
  | "Failed"
  | "Expired"

interface RowItem {
  columns: { content: React.ReactNode }[]
  key: string
  raw: OrderApi
}

interface OrderHistoryProps {
  data: OrderApi[]
}

const headers: HeaderItem[] = [
  { column: "Token", columnKey: "token", size: "medium", sortable: true },
  { column: "Type", columnKey: "type", size: "medium", sortable: true },
  { column: "Date", columnKey: "date", size: "medium", sortable: true },
  { column: "Paid", columnKey: "paid", size: "medium" },
  { column: "Received", columnKey: "received", size: "medium" },
  { column: "Status", columnKey: "status", size: "medium" },
  {
    column: undefined,
    columnKey: "export",
    size: "small",
    action: (
      <Button text="Export" variant="text" size="small" trailingIcon="Export" />
    ),
  },
]

const STATUS_CONFIG: Record<
  OrderStatus,
  { type: "success" | "warning" | "error" | "surface"; text: string }
> = {
  Processing: { type: "surface", text: "Processing" },
  Completed: { type: "success", text: "Completed" },
  Cancelling: { type: "warning", text: "Cancelling" },
  Canceled: { type: "surface", text: "Canceled" },
  Failed: { type: "error", text: "Failed" },
  Expired: { type: "error", text: "Expired" },
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
  if (token !== "BOTH" || !action) return false
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

const DateCell = ({ date }: { date: string }) => {
  const dateTime = new Date(date)

  return (
    <div className="px-16 py-12 text-nowrap">
      <span>
        {dateTime.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        })}
        ,{" "}
        {dateTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </span>
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
      <span>ADA</span>
    </div>
  )
}

const StatusCell = ({ status }: { status?: string | null }) => {
  if (!status) return <span>-</span>

  const config = STATUS_CONFIG[status as OrderStatus]

  if (!config) return <span>{status}</span>

  return (
    <div className="px-16 py-12">
      <Tag
        type={config.type}
        role="Secondary"
        size="small"
        text={config.text}
      />
    </div>
  )
}

const ExternalCell = ({
  txHash,
  status,
}: {
  txHash: string
  status?: string
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [showSnackbar, setShowSnackbar] = React.useState(false)

  const showCancel = status === "Processing"

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const handleCancelOrder = () => {
    setIsDialogOpen(false)
    setShowSnackbar(true)
    // TODO: Implement backend cancellation logic
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
            text="Cancel"
            variant="secondary"
            size="small"
            onClick={() => setIsDialogOpen(true)}
          />

          {isDialogOpen && (
            <Dialog
              title="Confirm Cancellation"
              description="You’re about to cancel your order. Once canceled, the order will be removed and no longer processed."
              type="Info"
              hasActions
              hasIcon
              hasPrimaryButton
              primaryButtonVariant="destructive"
              primaryButtonLabel="Cancel Order"
              hasSecondaryButton
              secondaryButtonLabel="Dismiss"
              hasSkrim={true}
              onSecondaryButtonClick={handleCloseDialog}
              onPrimaryButtonClick={handleCancelOrder}
            />
          )}
        </>
      )}
      <Link
        href={`https://preview.cardanoscan.io/transaction/${txHash}`}
        target="_blank"
      >
        <ButtonIcon size="small" variant="outlined" icon="External" />
      </Link>

      {showSnackbar && (
        <div className="fixed right-24 bottom-24 z-50">
          <Snackbar
            text="Your order has been canceled."
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

const OrderHistory: React.FC<OrderHistoryProps> = ({ data }) => {
  const rows: RowItem[] = useMemo(() => {
    if (!data.length) return []

    return data.map((order) => ({
      key: order.tx_hash,
      raw: order,
      columns: [
        { content: <TokenCell token={order.token} /> },
        { content: <TypeCell action={order.action} /> },
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
        { content: <StatusCell status={order.status} /> },
        {
          content: (
            <ExternalCell txHash={order.tx_hash} status={order.status} />
          ),
        },
      ],
    }))
  }, [data])

  if (!data.length) {
    return <Skeleton width="w-full" height="h-32" />
  }

  return (
    <Table
      headers={headers}
      RowComponent={TransactionDetails}
      rows={rows}
      totalCount={data.length}
    />
  )
}

export default OrderHistory
