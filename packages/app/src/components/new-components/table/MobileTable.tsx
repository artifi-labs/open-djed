import React from "react"
import Button from "../Button"
import { OrderApi } from "@/hooks/useOrders"
import Tag, { Type } from "../Tag"
import Asset from "../Asset"
import Divider from "../Divider"

export type MobileTableProps = {
  title: string
  rows: OrderApi[]
  rowsPerPage?: number
  paginatedTable?: boolean
  hasExport?: boolean
}

// THIS STATE SHOULD BE AN API TYPE OR SOMETHING
type OrderStatus = "Processing" | "Completed" | "Cancelled" | "Cancelling" | "Expired" | "Failed"
 
type OrderStatusChipProps = {
  status: OrderStatus
}

const OrderStatusTag: React.FC<OrderStatusChipProps> = ({ status }) => {
  const statusStyles: Record<OrderStatus, Type> = {
    Processing: "surface",
    Completed: "success",
    Expired: "error",
    Failed: "error",
    Cancelled: "surface",
    Cancelling: "warning"
  }
  const statusText: Record<OrderStatus, string> = {
    Processing: "Processing",
    Completed: "Completed",
    Expired: "Expired",
    Failed: "Failed",
    Cancelled: "Cancelled",
    Cancelling: "Cancelling"
  }
  return <Tag text={statusText[status]} role="Secondary" type={statusStyles[status]} size="small"/>
}

type AssetCellProps = {
  token: "DJED" | "SHEN" | "BOTH"
}

type ValueCellProps = {
  value: [string, string?]
}

const AssetCell: React.FC<AssetCellProps> = ({ token }) => {
  return (
    <div className="flex flex-row desktop:py-12 desktop:px-16 gap-8">
      {token === "BOTH" ? (
        <>
          <Asset coin="DJED" checked={false} size="small" />
          <Divider orientation="vertical" />
          <Asset coin="SHEN" checked={false} size="small" />
        </>
      ): (
        <Asset coin={token} checked={false} size="small" />
      )}
    </div>
  )
}


const ValueCell: React.FC<ValueCellProps> = ({ value }) => {
  return (
    <div className="flex flex-row desktop:py-12 desktop:px-16 gap-8">
      <p className="text-xs">{value[0]}</p>
      {value.length > 1 && (
        <>
          <Divider orientation="vertical" />
          <p className="text-xs">{value[1]}</p>
        </>
      )}
    </div>
  )
}

const MobileTableRow: React.FC<{
  order: OrderApi
  onViewTransaction?: () => void
  onCancel?: () => void
}> = ({ order, onViewTransaction, onCancel }) => {
  
  const paid = `${Number(order.paid) / 1e6} ${order.token}`
  const received = `${Number(order.received) / 1e6} ${order.token}`

  // TODO: UPDATE THIOS
  const showCancelButton = ["Processing"].includes(order.status)
      
  return (
    <div className="p-8 flex flex-col gap-16">
      <div className="flex flex-row gap-8 items-center">
        <div className="flex-1">
          <AssetCell token={order.token} />
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-row">
          <p className="flex-1 text-tertiary text-xxs">Type</p>
          <p className="text-xs font-normal">{order.action}</p>
        </div>
        <div className="flex flex-row">
          <p className="flex-1 text-tertiary text-xxs">Date</p>
          <p className="text-xs font-normal">{new Date(order.orderDate).toLocaleString()}</p>
        </div>
        <div className="flex flex-row">
          <p className="flex-1 text-tertiary text-xxs">Paid</p>
          <ValueCell value={[paid]} />
        </div>
        <div className="flex flex-row">
          <p className="flex-1 text-tertiary text-xxs">Received</p>
          <ValueCell value={[received]} />
        </div>
        <div className="flex flex-row">          
          <p className="flex-1 text-tertiary text-xxs">Status</p>
          <OrderStatusTag status={order.status as OrderStatus} />
        </div>
        <div className="flex flex-row gap-8 w-full mt-4">
          {!showCancelButton ? null :
            <Button
              text="Cancel"
              variant="secondary"
              size="small"
              className={`flex-1 ${!showCancelButton ? "hidden" : ""}`}
              disabled={false}
              onClick={onCancel}
            />
          }
          <Button
            text="View Transaction"
            variant="secondary"
            size="small"
            className="flex-1"
            onClick={onViewTransaction}
          />
        </div>
      </div>
    </div>
  )
}

const MobileTable: React.FC<MobileTableProps> = ({
  title,
  rows,
  rowsPerPage = 10,
  paginatedTable = true,
  hasExport = false
}) => {

  return (
    <div className="w-full">
      <div className="bg-background-primary border-border-primary max-h-175 w-full overflow-auto rounded-t-lg border border-b-0 p-16">
        <div className="inline-block min-w-full align-middle">
          <div className="flex justify-between items-center px-8 pb-8">
            <span className="text-md font-medium">{title}</span>
            {hasExport && <Button text="Export" variant="text" trailingIcon="Disconnect" size="small" />}
          </div>
          <div className="flex flex-col gap-12">
            {rows.map((row, index) => (
              <React.Fragment key={row.id}>
                <MobileTableRow
                  order={row}
                />
                {index < rows.length - 1 && <Divider orientation="horizontal"/>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
     
    </div>
  )
}

export default MobileTable
