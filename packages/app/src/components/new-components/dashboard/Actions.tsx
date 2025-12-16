"use client"

import * as React from "react"
import BaseCard from "../card/BaseCard"
import Tabs, { TabItem } from "../Tabs"
import Action from "./Action"
import { ActionType } from "./actionConfig"
import { useMintBurnAction } from "./useMintBurnAction"

export type ActionsProps = {
  defaultActionType: ActionType
  hasWalletConnected: boolean
}

const descriptionText: Record<ActionType, string> = {
  mint: "Mint DJED, SHEN or both by depositing ADA into the protocol.",
  burn: "Burn DJED, SHEN or both to withdraw your ADA from the protocol.",
}

const Actions: React.FC<ActionsProps> = ({
  defaultActionType,
  hasWalletConnected,
}) => {
  const [selectedAction, setSelectedAction] =
    React.useState<ActionType>(defaultActionType)

  const action = useMintBurnAction(selectedAction)

  const tabs: TabItem[] = [
    { key: "mint", leadingIcon: "Mint", text: "Mint" },
    { key: "burn", leadingIcon: "Burn", text: "Burn" },
  ]

  return (
    <BaseCard className="p-24">
      <div className="flex flex-col gap-24">
        <div className="flex flex-col gap-12">
          <Tabs
            type={1}
            items={tabs}
            activeItemIndex={tabs.findIndex((t) => t.key === selectedAction)}
            onTabChange={(tab) => setSelectedAction(tab.key as ActionType)}
          />

          <p className="text-tertiary text-xs">
            {descriptionText[selectedAction]}
          </p>
        </div>

        <Action
          actionType={selectedAction}
          hasWalletConnected={hasWalletConnected}
          config={action.config}
          bothSelected={action.bothSelected}
          setBothSelected={action.onBothSelectedChange}
          payValues={action.payValues}
          receiveValues={action.receiveValues}
          activePayToken={action.activePayToken}
          activeReceiveToken={action.activeReceiveToken}
          onPayValueChange={action.onPayValueChange}
          onReceiveValueChange={action.onReceiveValueChange}
          onPayTokenChange={action.onPayTokenChange}
          onReceiveTokenChange={action.onReceiveTokenChange}
          onButtonClick={action.onButtonClick}
        />
      </div>
    </BaseCard>
  )
}

export default Actions
