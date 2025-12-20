import type { OrderUTxO } from "@open-djed/txs"
import React from "react"
import { getWalletData } from "@/lib/getWalletData"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import { AppError } from "@open-djed/api/src/errors"
import type { Wallet } from "@/context/WalletContext"
import { useApiClient } from "@/context/ApiClientContext"
import Button from "../Button"
import Tag from "../Tag"
import ButtonIcon from "../ButtonIcon"
import { useEnv } from "@/context/EnvContext"
import Coin, { type IconCoinName } from "../Coin"
import Divider from "../Divider"
import { useOrders } from "@/hooks/useOrders"

type WalletOrderProps = {
  order: OrderUTxO
  wallet: Wallet
  divider: boolean
}

const WalletOrder: React.FC<WalletOrderProps> = ({
  order,
  wallet,
  divider,
}) => {
  const apiClient = useApiClient()
  const { network } = useEnv()
  const { formatDate, handleCancelOrder } = useOrders()

  const formatLovelace = (amount: bigint) =>
    (Number(amount) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })

  // this will be removed when integration with is done
  function getOrderDisplayInfo(
    actionFields: Record<string, { [key: string]: bigint }> | undefined,
    formatLovelace: (amount: bigint) => string,
  ): { actionType: string; token: string; paid: string; received: string } {
    if (!actionFields)
      return { actionType: "", token: "", paid: "", received: "" }

    if ("MintDJED" in actionFields) {
      const { adaAmount, djedAmount } = actionFields.MintDJED
      return {
        actionType: "Mint",
        paid: `${formatLovelace(adaAmount)} ADA`,
        received: `${formatLovelace(djedAmount)} DJED`,
        token: "DJED",
      }
    }

    if ("BurnDJED" in actionFields) {
      const { djedAmount } = actionFields.BurnDJED
      return {
        actionType: "Burn",
        paid: `${formatLovelace(djedAmount)} DJED`,
        received: "",
        token: "DJED",
      }
    }

    if ("MintSHEN" in actionFields) {
      const { adaAmount, shenAmount } = actionFields.MintSHEN
      return {
        actionType: "Mint",
        paid: `${formatLovelace(adaAmount)} ADA`,
        received: `${formatLovelace(shenAmount)} SHEN`,
        token: "SHEN",
      }
    }

    if ("BurnSHEN" in actionFields) {
      const { shenAmount } = actionFields.BurnSHEN
      return {
        actionType: "Burn",
        paid: `${formatLovelace(shenAmount)} SHEN`,
        received: "",
        token: "SHEN",
      }
    }

    return { actionType: "", token: "", paid: "", received: "" }
  }

  const { actionType, token, paid, received } = getOrderDisplayInfo(
    order.orderDatum?.actionFields,
    formatLovelace,
  )

  return (
    <div className="flex w-full flex-col gap-12">
      <div className="flex flex-row items-center justify-between">
        <Tag text={"Processing"} size="small" type="surface" role="Secondary" />
        <div className="flex flex-row items-center gap-8">
          <Button
            text="Cancel"
            variant="secondary"
            size="small"
            onClick={() => handleCancelOrder(order.txHash, order.outputIndex)}
          />
          <a
            href={`https://${network === "Preprod" ? "preprod." : ""}cardanoscan.io/transaction/${order.txHash}`}
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
          <Coin name={token as IconCoinName} checked={false} size="small" />
          <span className="text-xs">{actionType}</span>
          <span className="bg-secondary h-0.75 w-0.75 rounded-full"></span>
          <span className="text-secondary text-[10px]">
            {formatDate(order.orderDatum.creationDate)}
          </span>
        </div>
        <div className="flex flex-row items-center gap-4">
          <span className="text-xs">Paid: {paid}</span>
          <span className="bg-secondary h-0.75 w-0.75 rounded-full"></span>
          <span className="text-xs">Received: {received || "-"}</span>
        </div>
      </div>
      {divider && <Divider />}
    </div>
  )
}

export default WalletOrder
