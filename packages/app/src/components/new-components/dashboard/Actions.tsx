"use client"

import * as React from "react"
import BaseCard from "../card/BaseCard"
import Tabs, { TabItem } from "../Tabs"
import Action from "./Action"
import { ActionType } from "./actionConfig"
import { useMintBurnAction } from "./useMintBurnAction"

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

  return (
    <BaseCard className="p-24">
      <div className="flex flex-col gap-24">
        <div className="flex flex-col gap-12">
          <Tabs
            type={1}
            items={tabs}
            activeItemIndex={tabs.findIndex((t) => t.key === action.actionType)}
            onTabChange={(tab) => onActionChange?.(tab.key as ActionType)}
          />

          <p className="text-tertiary text-xs">
            {descriptionText[action.actionType]}
          </p>
        </div>

        <Action {...action} />
      </div>
    </BaseCard>
  )
}

export default Actions
