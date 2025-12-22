"use client"

import * as React from "react"
import { useMemo } from "react"
import clsx from "clsx"
import Link from "next/link"
import Table from "./table/Table"
import Button from "./Button"
import Coin from "./Coin"
import Divider from "./Divider"
import ButtonIcon from "./ButtonIcon"
import type { IconCoinName } from "./Coin"
import type { HeaderItem } from "./table/Table"
import Tag from "./Tag"
import Dialog from "./Dialog"
import Snackbar from "./Snackbar"
import { type OrderStatus, useOrders } from "@/hooks/useOrders"
import { type Order } from "@open-djed/api"
import { useEnv } from "@/context/EnvContext"
import BaseCard from "./card/BaseCard"

interface RowItem {
  columns: { content: React.ReactNode }[]
  key: string
}

interface OrderHistoryProps {
  data: Order[]
  filters: boolean
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

export const STATUS_CONFIG: Record<
  OrderStatus,
  { type: "success" | "warning" | "error" | "surface"; text: string }
> = {
  Processing: { type: "surface", text: "Processing" },
  Created: { type: "surface", text: "Created" },
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
  outIndex,
}: {
  txHash: string
  status?: string
  outIndex: number
}) => {
  const { network } = useEnv()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [showSnackbar, setShowSnackbar] = React.useState(false)
  const { handleCancelOrder } = useOrders()

  const showCancel = status === "Created"

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  React.useEffect(() => {
    if (!showSnackbar) return

    const time = setTimeout(() => setShowSnackbar(false), 4000)
    return () => clearTimeout(time)
  }, [showSnackbar])

  return (
    <div className="flex justify-end gap-8 px-16 py-6">
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
              onPrimaryButtonClick={() => handleCancelOrder(txHash, outIndex)}
            />
          )}
        </>
      )}

      <Link
        href={`https://${network.toLowerCase()}.cardanoscan.io/transaction/${txHash}`}
        target="_blank"
      >
        <ButtonIcon size="small" variant="outlined" icon="External" />
      </Link>

      <ButtonIcon
        size="tiny"
        variant="onlyIcon"
        icon="Chevron-down"
        className={clsx("transition-transform duration-200", {
          "rotate-180": isOpen,
        })}
        onClick={handleToggle}
      />
      {/* TODO: Implement view Tx details */}

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

const OrderHistory: React.FC<OrderHistoryProps> = ({ data, filters }) => {
  const rows: RowItem[] = useMemo(() => {
    if (!data.length) return []

    return data.map((order) => {
      return {
        key: order.tx_hash,
        columns: [
          { content: <TokenCell token={order.token} /> },
          { content: <TypeCell action={order.action} /> },
          {
            content: <DateCell date={order.orderDate} />,
          },
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
              <ExternalCell
                txHash={order.tx_hash}
                outIndex={order.out_index}
                status={order.status}
              />
            ),
          },
        ],
      }
    })
  }, [data])

  if (!data.length) {
    return (
      <BaseCard
        border="border-gradient border-color-primary"
        className="justify-center p-16"
      >
        <div className="flex flex-col text-center items-center justify-center gap-24">
          {/* TITLE & DESCRIPTION */}
          <div className="flex flex-col gap-6">
            <p className="text-lg font-semibold">
              {filters ? "No orders to display." : "No orders to display yet."}
            </p>

            <p className="text-sm">
              {filters
                ? "No orders found with the requested filter."
                : "Looks like this wallet hasn't made any trades."}
            </p>
          </div>

          <Link href={"/"}>
            <Button text="Mint & Burn Now" variant="accent" size="small" />
          </Link>
        </div>
      </BaseCard>
    )
  }

  return <Table headers={headers} rows={rows} totalCount={data.length} />
}

export default OrderHistory
