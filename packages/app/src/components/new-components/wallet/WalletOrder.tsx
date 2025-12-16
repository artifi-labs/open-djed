import type { OrderUTxO } from "@open-djed/txs"
import React from "react"
import { getWalletData } from "@/lib/getWalletData"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import type { AppError } from "@open-djed/api/src/errors"
import type { Wallet } from "@/context/WalletContext"
import { useApiClient } from "@/context/ApiClientContext"
import Button from "../Button"
import Tag from "../Tag"
import ButtonIcon from "../ButtonIcon"
import { useEnv } from "@/context/EnvContext"
import Coin, { type IconCoinName } from "../Coin"
import Divider from "../Divider"

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

  function formatRelativeDate(timestampMs: bigint): string {
    const date = new Date(Number(timestampMs))
    const now = new Date()

    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffDays = Math.floor(diffMs / 86400000)

    // if date is less than 1 hour ago → "X min(s) ago"
    if (diffMinutes < 60) {
      if (diffMinutes <= 1) return "1 min ago"
      return `${diffMinutes} mins ago`
    }

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

    // if date is more than 1h ago but less than 24h → "Today, 14:30"
    if (diffDays === 0) {
      return `Today, ${time}`
    }

    // if date is more than 24h ago but less than 48h → "Yesterday, 21:30"
    if (diffDays === 1) {
      return `Yesterday, ${time}`
    }

    // if date is more than 48h ago → "12/02/2020, 14:30"
    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }
  const creationDate = formatRelativeDate(order.orderDatum.creationDate)

  const handleCancelOrder = async (orderTx: string, outIndex: number) => {
    const { Transaction, TransactionWitnessSet } =
      await import("@dcspark/cardano-multiplatform-lib-browser")
    if (!wallet) return
    try {
      const { address, utxos } = await getWalletData(wallet)
      const response = await apiClient.api["cancel-order"].$post({
        json: {
          hexAddress: address,
          utxosCborHex: utxos,
          txHash: orderTx,
          outIndex,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new AppError(errorData.message)
      }
      const txCbor = await response.text()
      const txHash = await signAndSubmitTx(
        wallet,
        txCbor,
        Transaction,
        TransactionWitnessSet,
      )
      // TODO replace with toast
      console.log("Transaction submitted with hash:", txHash)
    } catch (err) {
      console.error("Action failed:", err)
      if (err instanceof AppError) {
        // TODO replace with toast
        console.error("AppError:", err.message)
      }
    }
  }

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
          <span className="text-secondary text-[10px]">{creationDate}</span>
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
