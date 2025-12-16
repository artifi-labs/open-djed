import * as React from "react"
import clsx from "clsx"
import BaseCard from "./card/BaseCard"
import Tabs, { TabItem } from "./Tabs"
import Action from "./Action"

type ActionType = "mint" | "burn"

export type ActionsProps = {
  defaultActionType: ActionType
  hasWalletConnected: boolean
}

const Actions: React.FC<ActionsProps> = ({
  defaultActionType,
  hasWalletConnected = false,
}) => {
  const [selectedAction, setSelectedAction] =
    React.useState<ActionType>(defaultActionType)

  const descriptionText: Record<ActionType, string> = {
    mint: "Mint DJED, SHEN or both by depositing ADA into the protocol.",
    burn: "Burn DJED, SHEN or both to withdraw your ADA from the protocol.",
  }

  const ActionSelector: React.FC = () => {
    const tabs: TabItem[] = [
      { key: "mint", leadingIcon: "Mint", text: "Mint" },
      { key: "burn", leadingIcon: "Burn", text: "Burn" },
    ]

    return (
      <Tabs
        type={1}
        items={tabs}
        activeItemIndex={tabs.findIndex((t) => t.key === selectedAction)}
        onTabChange={(tab) => setSelectedAction(tab.key as ActionType)}
      />
    )
  }

  const baseCardClassNames = clsx("p-24")

  return (
    <BaseCard className={baseCardClassNames}>
      <div className="flex flex-col gap-24">
        {/* Header */}
        <div className="flex flex-col gap-12">
          <ActionSelector />
          <p className="text-tertiary text-xs">
            {descriptionText[selectedAction]}
          </p>
        </div>
        {/* TODO: Snackbar */}
        <div></div>

        <Action
          actionType={selectedAction}
          hasWalletConnected={hasWalletConnected}
        />
      </div>
    </BaseCard>
  )
}

export default Actions
