import React from "react"
import Button from "../Button"
import Tag from "../Tag"
import ButtonIcon from "../ButtonIcon"
import { useEnv } from "@/context/EnvContext"
import Coin, { type IconCoinName } from "../Coin"
import Divider from "../Divider"
import { type OrderStatus, useOrders } from "@/hooks/useOrders"
import { type Order } from "@open-djed/api"
import { STATUS_CONFIG } from "../OrderHistory"

type WalletOrderProps = {
  order: Order
  divider: boolean
}

const WalletOrder: React.FC<WalletOrderProps> = ({ order, divider }) => {
  const { network } = useEnv()
  const { handleCancelOrder, formatDate } = useOrders()

  const formatLovelace = (amount: bigint) =>
    (Number(amount) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })

  const statusConfig = STATUS_CONFIG[order.status as OrderStatus]

  return (
    <div className="flex w-full flex-col gap-12">
      <div className="flex flex-row items-center justify-between">
        <Tag
          type={statusConfig.type}
          role="Secondary"
          size="small"
          text={statusConfig.text}
        />
        <div className="flex flex-row items-center gap-8">
          {order.status === "Created" && (
            <Button
              text="Cancel"
              variant="secondary"
              size="small"
              onClick={() => {
                handleCancelOrder(order.tx_hash, order.out_index).catch(
                  console.error,
                )
              }}
            />
          )}
          <a
            href={`https://${network === "Preprod" ? "preprod." : ""}cardanoscan.io/transaction/${order.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ButtonIcon icon="External" size="small" variant="outlined" />
          </a>
        </div>
      </div>

      <div
        className={`flex flex-col items-start gap-8 md:flex-row md:justify-between ${!divider && "mb-18"}`}
      >
        <div className="flex flex-row items-center gap-4">
          <Coin
            name={order.token as IconCoinName}
            checked={false}
            size="small"
          />
          <span className="text-xs">{order.action}</span>
          <span className="bg-secondary h-0.75 w-0.75 rounded-full"></span>
          <span className="text-secondary text-[10px]">
            {formatDate(BigInt(new Date(order.orderDate).getTime()))}
            {/*{order.orderDate.toString()}*/}
          </span>
        </div>
        <div className="flex flex-row items-center gap-4">
          <span className="text-xs">
            Paid: {formatLovelace(order.paid ?? 0n)}
          </span>
          <span className="bg-secondary h-0.75 w-0.75 rounded-full"></span>
          <span className="text-xs">
            Received: {formatLovelace(order.received ?? 0n)}
          </span>
        </div>
      </div>
      {divider && <Divider />}
    </div>
  )
}

export default WalletOrder
