"use client"

import * as React from "react"
import Button from "../Button"
import type { ActionType } from "./actionConfig"
import InputSection from "./InputSection"
import { useTranslations } from "next-intl"
import {
  type ButtonState,
  type TokenActionStateMap,
} from "@/hooks/dashboard/useMintBurnAction"

export type ActionProps = {
  tokensStates: TokenActionStateMap
  actionType: ActionType
  minMessage?: string
  button: ButtonState
}

const Action: React.FC<ActionProps> = ({
  tokensStates,
  actionType,
  button,
}) => {
  const t = useTranslations()

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
        text={button.text}
        disabled={button.disabled}
        onClick={() => void button.onClick?.()}
      />
    </div>
  )
}

export default Action
