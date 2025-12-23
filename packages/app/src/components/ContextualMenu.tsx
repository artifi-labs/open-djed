"use client"
import clsx from "clsx"

import React from "react"
import ListItem, { type ListItemProps } from "./ListItem"

export type ContextualMenuProps = {
  items?: ContextualMenuItem[]
  hideAmount?: boolean
  onClick?: (item: ContextualMenuItem) => void
}

export type ContextualMenuItem = Omit<
  ListItemProps,
  "action" | "className" | "onClick"
> & {
  key: string | number
}

function normalizeItem(
  item: ContextualMenuItem,
  divider: boolean,
  onClickGlobal: (item: ContextualMenuItem) => void,
  hideAmountGlobal: boolean,
): ListItemProps {
  const baseItem: ListItemProps = {
    coin: item.coin,
    checked: item.checked,
    divider,
    wallet: item.wallet,
    text: item.text || "",
    icon: item.icon,
    onClick: () => onClickGlobal(item),
  }

  if (item.amount === true) {
    return {
      ...baseItem,
      amount: true,
      hideAmount: hideAmountGlobal,
      amountUpperText: item.amountUpperText || "",
      amountLowerText: item.amountLowerText || "",
    }
  }

  return {
    ...baseItem,
    amount: false,
  }
}

const ContextualMenu: React.FC<ContextualMenuProps> = ({
  items = [],
  hideAmount = false,
  onClick = () => {},
}) => {
  const handleItemClick: (item: ContextualMenuItem) => void = React.useCallback(
    (item: ContextualMenuItem) => {
      onClick(item)
    },
    [onClick],
  )

  const baseClassName = clsx(
    "w-full",
    "border-gradient border-color-gradient",
    "bg-surface-tertiary rounded-4 shadow-[0_14px_34px_0_rgba(0,0,0,0.4)]",
    "overflow-y-auto",
  )

  return (
    <div className={baseClassName}>
      <div className="flex max-h-[320px] flex-col items-start overflow-y-auto p-4">
        {items.map((item, index) => (
          <ListItem
            key={item.key}
            {...normalizeItem(
              item,
              index < items.length - 1,
              handleItemClick,
              hideAmount,
            )}
          />
        ))}
      </div>
    </div>
  )
}

export default ContextualMenu
