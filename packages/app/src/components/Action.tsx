"use client"

import { useState } from "react"
import { useWallet } from "@/context/WalletContext"
import Button from "@/components/Button"
import { useApiClient } from "@/context/ApiClientContext"
import { useProtocolData } from "@/hooks/useProtocolData"
import { registryByNetwork } from "@open-djed/registry"
import { AmountInput } from "@/components/AmountInput"
import type { ActionType, TokenType } from "@open-djed/api"
import { useEnv } from "@/context/EnvContext"
import Toast from "./Toast"
import { formatNumber, formatValue, type Value } from "@/lib/utils"
import { Rational } from "@open-djed/math"
import { AppError } from "@open-djed/api/src/errors"
import Tooltip from "./Tooltip"
import { SkeletonWrapper } from "./SkeletonWrapper"
import { useTranslation } from "react-i18next"
import { useActionLabels } from "@/hooks/useLabels"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import { getWalletData } from "@/lib/getWalletData"

type ActionProps = {
  action: ActionType
  bothSelectable: boolean,
  token: TokenType
  onActionStart: () => void
  onActionComplete: () => void
}

export const Action = ({
  action,
  token,
  onActionStart,
  onActionComplete,
}: ActionProps) => {
  const { t } = useTranslation()
  const [amount, setAmount] = useState<number>(0)
  const [toastProps, setToastProps] = useState<{
    message: string
    type: "success" | "error"
    show: boolean
  }>({
    message: "",
    type: "success",
    show: false,
  })
  const client = useApiClient()
  const { wallet } = useWallet()

  const { isPending, error, data } = useProtocolData()
  const { network } = useEnv()
  const protocolData = data?.protocolData
  const actionData = data?.tokenActionData(token, action, amount)

  const actionLabels = useActionLabels()

  if (error)
    return <div className="font-bold text-red-500">Error: {error.message}</div>

  const handleActionClick = async () => {
    //NOTE: This is a workaround to dynamically import the Cardano libraries without causing issues with SSR.
    const { Transaction, TransactionWitnessSet } =
      await import("@dcspark/cardano-multiplatform-lib-browser")
    if (!wallet || amount <= 0) return
    onActionStart()

    try {
      const { address, utxos } = await getWalletData(wallet)

      const response = await client.api[":token"][":action"][":amount"][
        "tx"
      ].$post({
        param: { token, action, amount: amount.toString() },
        json: { hexAddress: address, utxosCborHex: utxos },
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
        message: `Transaction submitted: ${txHash}`,
        type: "success",
        show: true,
      })

      onActionComplete()
    } catch (err) {
      console.error("Action failed:", err)
      if (err instanceof AppError) {
        setToastProps({ message: `${err.message}`, type: "error", show: true })
        onActionComplete()
        return
      }

      setToastProps({
        message: `Transaction failed. Please try again.`,
        type: "error",
        show: true,
      })
      onActionComplete()
    }
  }

  const registry = registryByNetwork[network]
  // FIXME: This is not perfect yet.
  const balance =
    Math.round(
      Math.min(
        Math.max(
          (action === "Burn"
            ? wallet?.balance[token]
            : ((wallet?.balance.ADA ?? 0) -
                (Number(registry.operatorFeeConfig.max) +
                  (protocolData?.refundableDeposit.ADA ?? 1823130)) /
                  1e6) /
              (protocolData ? protocolData[token].buyPrice.ADA : 0)) ?? 0,
          0,
        ),
        (action === "Mint"
          ? protocolData?.[token].mintableAmount[token]
          : protocolData?.[token].burnableAmount[token]) ?? 0,
      ) * 1e6,
    ) / 1e6
  const toUSD = data ? (value: Value) => data.to(value, "DJED") : undefined
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground rounded-xl p-4 shadow-md md:p-6">
      <h2 className="mb-6 text-2xl font-bold">
        {action} {token}
      </h2>

      <div className="mb-6 flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{t("action.baseCost")}</p>
            <Tooltip text={t("action.tooltip.baseCost")} />
          </div>
          <SkeletonWrapper isPending={isPending}>
            <p className="flex items-center justify-center text-lg">
              {formatValue(actionData?.baseCost ?? {})}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? `$${formatNumber(toUSD(actionData?.baseCost ?? {}), { maximumFractionDigits: 2 })}`
                : "-"}
            </p>
          </SkeletonWrapper>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">
              {t("action.actionFee", { action: actionLabels[action] })}
            </p>
            <Tooltip
              text={t("action.tooltip.actionFee", {
                percentage: actionData?.actionFeePercentage ?? "-",
              })}
            />
          </div>
          <SkeletonWrapper isPending={isPending}>
            <p className="flex items-center justify-center text-lg">
              {formatValue(actionData?.actionFee ?? {})}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? `$${formatNumber(toUSD(actionData?.actionFee ?? {}), { maximumFractionDigits: 2 })}`
                : "-"}
            </p>
          </SkeletonWrapper>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{t("action.OperatorFee")}</p>
            <Tooltip
              text={t("action.tooltip.operatorFee", {
                percentage:
                  registry.operatorFeeConfig.percentage.toNumber() * 100,
                base: actionData ? formatValue(actionData?.baseCost) : "-",
                fee: actionData ? formatValue(actionData?.actionFee) : "-",
                min: new Rational({
                  numerator: registry.operatorFeeConfig.min,
                  denominator: 1_000_000n,
                }).toNumber(),
                max: Number(registry.operatorFeeConfig.max) * 1e-6,
              })}
            />
          </div>
          <SkeletonWrapper isPending={isPending}>
            <p className="flex items-center justify-center text-lg">
              {formatValue(actionData?.operatorFee ?? {})}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? `$${formatNumber(toUSD(actionData?.operatorFee ?? {}), { maximumFractionDigits: 2 })}`
                : "-"}
            </p>
          </SkeletonWrapper>
        </div>
        <div className="my-2 w-full px-10">
          <hr className="light-action-line border-light-action-line dark:border-dark-action-line" />
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{t("action.totalCost")}</p>
            <Tooltip
              text={t("action.tooltip.totalCost", {
                base: actionData ? formatValue(actionData?.baseCost) : "-",
                fee: actionData ? formatValue(actionData?.actionFee) : "-",
                operator: actionData
                  ? formatValue(actionData?.operatorFee)
                  : "-",
              })}
            />
          </div>
          <SkeletonWrapper isPending={isPending}>
            <p className="flex items-center justify-center text-lg">
              {formatValue(actionData?.totalCost ?? {})}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? `$${formatNumber(toUSD(actionData?.totalCost ?? {}), { maximumFractionDigits: 2 })}`
                : "-"}
            </p>
          </SkeletonWrapper>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{t("action.refundable")}</p>
            <Tooltip text={t("action.tooltip.refundable")} />
          </div>
          <SkeletonWrapper isPending={isPending}>
            <p className="flex items-center justify-center text-lg">
              {formatValue(protocolData?.refundableDeposit ?? {})}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? `$${formatNumber(toUSD(protocolData?.refundableDeposit ?? {}), { maximumFractionDigits: 2 })}`
                : "-"}
            </p>
          </SkeletonWrapper>
        </div>
        <div className="my-2 w-full px-10">
          <hr className="light-action-line border-light-action-line dark:border-dark-action-line" />
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{t("action.youSend")}</p>
            <Tooltip
              text={t("action.tooltip.youSend", {
                total: actionData ? formatValue(actionData.totalCost) : "-",
                refundable: protocolData
                  ? formatValue(protocolData.refundableDeposit)
                  : "-",
              })}
            />
          </div>
          <SkeletonWrapper isPending={isPending}>
            <p className="flex items-center justify-center text-lg">
              {formatValue(actionData?.toSend ?? {})}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? `$${formatNumber(toUSD(actionData?.toSend ?? {}), { maximumFractionDigits: 2 })}`
                : "-"}
            </p>
          </SkeletonWrapper>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{t("action.youReceive")}</p>
            <Tooltip text={t("action.tooltip.youReceive")} />
          </div>
          <SkeletonWrapper isPending={isPending}>
            <p className="flex items-center justify-center text-lg">
              {`${action === "Burn" ? "~" : ""}${formatValue(actionData?.toReceive ?? {})}`}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? `${action === "Burn" ? "~" : ""}$${formatNumber(toUSD(actionData?.toReceive ?? {}), { maximumFractionDigits: 2 })}`
                : "-"}
            </p>
          </SkeletonWrapper>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{t("action.price")}</p>
            <Tooltip
              text={t("action.tooltip.price", {
                token: token,
              })}
            />
          </div>
          <SkeletonWrapper isPending={isPending}>
            <p className="flex items-center justify-center text-lg">
              {`${action === "Burn" ? "~" : ""}${actionData && Number.isFinite(actionData.price.ADA) ? formatValue(actionData.price) : "0 ADA"}/${token}`}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? `${action === "Burn" ? "~" : ""}$${actionData && Number.isFinite(actionData.price.ADA) ? formatNumber(toUSD(actionData?.price ?? {}), { maximumFractionDigits: 3 }) : "0"}`
                : "-"}
            </p>
          </SkeletonWrapper>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <AmountInput
          value={amount}
          onChange={setAmount}
          max={balance}
          min={50}
          step={1}
          unit={token}
          disabled={wallet === null || isPending}
        />

        <Button
          className="w-full"
          onClick={handleActionClick}
          disabled={
            wallet === null ||
            amount <= 0 ||
            amount < Number(registryByNetwork[network].minAmount) * 1e-6 ||
            isPending ||
            amount > balance
          }
        >
          {actionLabels[action]}
        </Button>
      </div>
      <Toast
        message={toastProps.message}
        show={toastProps.show}
        onClose={() => setToastProps({ ...toastProps, show: false })}
        type={toastProps.type}
      />
    </div>
  )
}
