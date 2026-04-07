"use client"

import * as React from "react"
import Button from "../Button"
import { capitalize } from "@/utils"
import type { ActionType } from "./actionConfig"
import InputSection from "./InputSection"
import { useReserveDetails } from "@/hooks/useReserveDetails"
import { useTranslations } from "next-intl"
import { type TokenActionStateMap } from "@/hooks/dashboard/useMintBurnAction"

export type ActionProps = {
  tokensStates: TokenActionStateMap
  actionType: ActionType
  hasWalletConnected: boolean
  onButtonClick?: () => void
  minWarningMessage?: string
  minMessage?: string
}

const Action: React.FC<ActionProps> = ({
  tokensStates,
  actionType,
  hasWalletConnected,
  onButtonClick,
  minWarningMessage,
  minMessage,
}) => {
  const t = useTranslations()
  const { reserveBounds } = useReserveDetails()

  const actionText = capitalize(t(`action.${actionType.toLowerCase()}`))

  const buttonControls = React.useMemo(() => {
    const tokens = actionType === "Mint" ? tokensStates.receive.tokens : tokensStates.pay.tokens

    const disabledDueToReserve =
      ((tokens.includes("DJED") && actionType === "Mint") ||
        (tokens.includes("SHEN") && actionType === "Burn")) &&
      reserveBounds === "below"
        ? true
        : tokens.includes("SHEN") && actionType === "Mint" && reserveBounds === "above"
          ? true
          : false

    const isPayEmpty = tokensStates.pay.inputs.some((i) => i.value === 0)
    const isReceiveEmpty = tokensStates.receive.inputs.some((i) => i.value === 0)

    const isDisabled =
      (hasWalletConnected && (isPayEmpty || isReceiveEmpty)) || disabledDueToReserve

    const text = !hasWalletConnected
      ? t("dashboard.actionButton.wallet", { action: actionText })
      : isPayEmpty || isReceiveEmpty
        ? t("dashboard.actionButton.fillAmount", { action: actionText })
        : `${actionText} ${minMessage || ""}`

    return { isDisabled, text }
  }, [hasWalletConnected, actionType])

  const inputSections = [
    {
      key: "pay",
      label: t("dashboard.youPay"),
      states: tokensStates.pay,
    },
    {
      key: "receive",
      label: t("dashboard.youReceive"),
      states: tokensStates.receive,
    },
  ]

  return (
    <div className="desktop:gap-24 flex flex-col gap-18">
      {inputSections.map((i) => (
        <InputSection
          key={i.key}
          action={actionType}
          label={i.label}
          state={i.states}
        />
      ))}

      <Button
        variant="secondary"
        size="medium"
        text={buttonControls.text}
        disabled={buttonControls.isDisabled}
        onClick={onButtonClick}
      />
    </div>
  )
}

export default Action
