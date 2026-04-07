"use client"

import * as React from "react"
import BaseCard from "../card/BaseCard"
import Tabs, { type TabItem } from "../Tabs"
import Action from "./Action"
import type { ActionType } from "./actionConfig"
import type { useMintBurnAction } from "./useMintBurnAction"
import Snackbar from "../Snackbar"
import { useReserveDetails } from "@/hooks/useReserveDetails"
import { useTranslations } from "next-intl"
import { capitalize } from "@/utils"

export type ActionsProps = {
  action: ReturnType<typeof useMintBurnAction>
  onActionChange?: (actionType: ActionType) => void
}

const Actions: React.FC<ActionsProps> = ({ action, onActionChange }) => {
  const t = useTranslations()
  const tabs: TabItem[] = [
    { key: "Mint", leadingIcon: "Mint", text: capitalize(t("action.mint")) },
    { key: "Burn", leadingIcon: "Burn", text: capitalize(t("action.burn")) },
  ]

  const descriptionText: Record<ActionType, string> = {
    Mint: t("dashboard.action.Mint.description"),
    Burn: t("dashboard.action.Burn.description"),
  }

  const { reserveWarning } = useReserveDetails()

  return (
    <BaseCard className="desktop:p-24 p-16">
      <div className="desktop:gap-24 flex flex-col gap-16">
        <div className="flex flex-col gap-12">
          <Tabs
            type={"primary"}
            items={tabs}
            activeItemIndex={tabs.findIndex((t) => t.key === action.actionType)}
            onTabChange={(tab) => onActionChange?.(tab.key as ActionType)}
            className="desktop:w-fit w-full"
          />

          <p className="text-tertiary text-xs">
            {descriptionText[action.actionType]}
          </p>
        </div>

        {reserveWarning && (
          <Snackbar
            text={reserveWarning}
            type="attention"
            leadingIcon={"Information"}
            closeIcon={false}
            action={false}
            full={true}
          />
        )}

        <Action {...action} />
      </div>
    </BaseCard>
  )
}

export default Actions
