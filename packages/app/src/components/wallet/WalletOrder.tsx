import React from "react"
import Button from "../Button"
import Tag from "../Tag"
import ButtonIcon from "../ButtonIcon"
import Coin, { type IconCoinName } from "../Coin"
import Divider from "../Divider"
import { type Order } from "@open-djed/api"
import { STATUS_CONFIG } from "../order/OrderHistory"
import { CARDANOSCAN_BASE_URL } from "@/lib/constants"
import { useTranslations } from "next-intl"
import { capitalize, formatRelativeDate } from "@/lib/utils"
import { useCancelOrder } from "@/hooks/orders/useCancelOrder"

type WalletOrderProps = {
  order: Order
  divider: boolean
}

const WalletOrder: React.FC<WalletOrderProps> = ({ order, divider }) => {
  const t = useTranslations()
  const { cancelOrder } = useCancelOrder()

  const formatLovelace = (amount: number) =>
    (Number(amount) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })

  const statusConfig = STATUS_CONFIG[order.status]

  return (
    <div className="flex w-full flex-col gap-12">
      <div className="flex flex-row items-center justify-between">
        <Tag
          type={statusConfig.type}
          role="Secondary"
          size="small"
          text={t(statusConfig.i18nKey)}
        />
        <div className="flex flex-row items-center gap-8">
          {order.status === "Created" && (
            <Button
              text={t("wallet.orders.cancel")}
              variant="secondary"
              size="small"
              onClick={() => {
                cancelOrder(order.tx_hash, order.out_index).catch(console.error)
              }}
            />
          )}
          <a
            href={`${CARDANOSCAN_BASE_URL}/transaction/${order.tx_hash}`}
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
          <span className="text-xs">
            {capitalize(t(`action.${order.action.toLowerCase()}`))}
          </span>
          <span className="bg-secondary h-0.75 w-0.75 rounded-full"></span>
          <span className="text-secondary text-[10px]">
            {formatRelativeDate(BigInt(new Date(order.orderDate).getTime()))}
          </span>
        </div>
        <div className="flex flex-row items-center gap-4">
          <span className="text-xs">
            {t("wallet.orders.paid")}: {formatLovelace(order.paid ?? 0)}
          </span>
          <span className="bg-secondary h-0.75 w-0.75 rounded-full"></span>
          <span className="text-xs">
            {t("wallet.orders.received")}: {formatLovelace(order.received ?? 0)}
          </span>
        </div>
      </div>
      {divider && <Divider />}
    </div>
  )
}

export default WalletOrder
