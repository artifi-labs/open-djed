"use client"

import * as React from "react"
import BaseCard from "../card/BaseCard"
import Tabs, { type TabItem } from "../Tabs"
import Action from "./Action"
import type { ActionType } from "./actionConfig"
import type { useMintBurnAction } from "./useMintBurnAction"
import Snackbar from "../Snackbar"

export type ActionsProps = {
  action: ReturnType<typeof useMintBurnAction>
  onActionChange?: (actionType: ActionType) => void
}

const Actions: React.FC<ActionsProps> = ({ action, onActionChange }) => {
  const tabs: TabItem[] = [
    { key: "Mint", leadingIcon: "Mint", text: "Mint" },
    { key: "Burn", leadingIcon: "Burn", text: "Burn" },
  ]

  const descriptionText: Record<ActionType, string> = {
    Mint: "Mint DJED, SHEN or both by depositing ADA into the protocol.",
    Burn: "Burn DJED, SHEN or both to withdraw your ADA from the protocol.",
  }

  const { reserveWarning } = action.reserveDetails()

  return (
    <BaseCard className="p-24">
      <div className="flex flex-col gap-24">
        <div className="flex flex-col gap-12">
          <Tabs
            type={"primary"}
            items={tabs}
            activeItemIndex={tabs.findIndex((t) => t.key === action.actionType)}
            onTabChange={(tab) => onActionChange?.(tab.key as ActionType)}
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
