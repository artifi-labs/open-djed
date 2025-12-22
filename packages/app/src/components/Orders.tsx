"use client"
import { useEffect, useState } from "react"
import JSONbig from "json-bigint"
import Tooltip from "@/components/Tooltip"
import Button from "@/components/Button"
import type { OrderUTxO } from "@open-djed/txs"
import { AppError } from "@open-djed/api/src/errors"
import { getWalletData } from "@/lib/getWalletData"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import { useApiClient } from "@/context/ApiClientContext"
import type { Wallet } from "@/context/WalletContext"

export default function Orders({
  wallet,
  setToastProps,
}: {
  wallet: Wallet
  setToastProps: React.Dispatch<
    React.SetStateAction<{
      message: string
      type: "success" | "error"
      show: boolean
    }>
  >
}) {
  const [orders, setOrders] = useState<OrderUTxO[]>([])
  const [tooltipText, setTooltipText] = useState("Click to copy full Tx Hash")

  const client = useApiClient()

  useEffect(() => {
    if (!wallet) return

    const fetchOrders = async () => {
      const usedAddress = await wallet.getUsedAddresses()
      if (!usedAddress) throw new Error("Failed to get used address")

      try {
        const res = await client.api.orders.$post({
          json: { usedAddresses: usedAddress },
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.text()
        const parsed = JSONbig.parse(data)
        setOrders(parsed.orders)
      } catch (err) {
        console.error("Error fetching orders:", err)
      }
    }

    fetchOrders().catch(console.error)
  }, [wallet])

  const handleCancelOrder = async (orderTx: string, outIndex: number) => {
    const { Transaction, TransactionWitnessSet } =
      await import("@dcspark/cardano-multiplatform-lib-browser")
    if (!wallet) return
    try {
      const { address, utxos } = await getWalletData(wallet)
      const response = await client.api["cancel-order"].$post({
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
      setToastProps({
        message: `Order cancelation submitted: ${txHash}`,
        type: "success",
        show: true,
      })
    } catch (err) {
      console.error("Action failed:", err)
      if (err instanceof AppError) {
        setToastProps({ message: err.message, type: "error", show: true })
      }
    }
  }

  const formatLovelace = (amount: bigint) =>
    (Number(amount) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })

  function getOrderDisplayInfo(
    actionFields: Record<string, { [key: string]: bigint }> | undefined,
    formatLovelace: (amount: bigint) => string,
  ): { actionType: string; conversionLine: string } {
    if (!actionFields) return { actionType: "", conversionLine: "" }

    if ("MintDJED" in actionFields) {
      const { adaAmount, djedAmount } = actionFields.MintDJED
      return {
        actionType: "Mint DJED",
        conversionLine: `${formatLovelace(adaAmount)} ADA => ${formatLovelace(djedAmount)} DJED`,
      }
    }

    if ("BurnDJED" in actionFields) {
      const { djedAmount } = actionFields.BurnDJED
      return {
        actionType: "Burn DJED",
        conversionLine: `${formatLovelace(djedAmount)} DJED`,
      }
    }

    if ("MintSHEN" in actionFields) {
      const { adaAmount, shenAmount } = actionFields.MintSHEN
      return {
        actionType: "Mint SHEN",
        conversionLine: `${formatLovelace(adaAmount)} ADA => ${formatLovelace(shenAmount)} SHEN`,
      }
    }

    if ("BurnSHEN" in actionFields) {
      const { shenAmount } = actionFields.BurnSHEN
      return {
        actionType: "Burn SHEN",
        conversionLine: `${formatLovelace(shenAmount)} SHEN`,
      }
    }

    return { actionType: "", conversionLine: "" }
  }

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <h1 className="font-bold">Pending Orders:</h1>
        <div className="flex w-full flex-col gap-6">
          {orders.length > 0 ? (
            orders.map((order, index) => {
              const creationDate = new Date(
                Number(order.orderDatum?.creationDate),
              ).toLocaleString()

              const copyTxHash = () => {
                navigator.clipboard
                  .writeText(order.txHash)
                  .then(() => setTooltipText("Copied!"))
                  .catch(() => setTooltipText("Failed to copy"))
                setTimeout(
                  () => setTooltipText("Click to copy full Tx Hash"),
                  2000,
                )
              }

              const { actionType, conversionLine } = getOrderDisplayInfo(
                order.orderDatum?.actionFields,
                formatLovelace,
              )

              return (
                <div
                  key={index}
                  className="bg-primary text-dark-text w-full max-w-2xl space-y-2 rounded-xl p-4 shadow"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">Order #{index + 1}</p>
                    <Button
                      className="bg-red-400"
                      onClick={() => {
                        handleCancelOrder(
                          order.txHash,
                          order.outputIndex,
                        ).catch(console.error)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-xl font-bold">{actionType}</span>
                    <span>{creationDate}</span>
                  </div>
                  <p className="text-md">{conversionLine}</p>

                  <Tooltip
                    text={tooltipText}
                    tooltipDirection="top"
                    tooltipModalClass="text-light-text dark:text-dark-text"
                  >
                    <p
                      onClick={copyTxHash}
                      className="text-muted-foreground cursor-pointer text-sm select-none hover:underline"
                    >
                      Tx Hash: {order.txHash.slice(0, 22)}...#
                      {order.outputIndex}
                    </p>
                  </Tooltip>
                </div>
              )
            })
          ) : (
            <p className="font-semibold text-red-500">No pending orders.</p>
          )}
        </div>
      </div>
    </>
  )
}
