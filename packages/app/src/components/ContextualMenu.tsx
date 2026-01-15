"use client"
import clsx from "clsx"

import React from "react"
import ListItem, { type ListItemProps } from "./ListItem"

export type ContextualMenuProps = {
  items?: ContextualMenuItem[]
  hideAmount?: boolean
  activeItem?: ContextualMenuItem
  width?: string
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
  activeItem,
  width,
  onClick = () => {},
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef<Record<string | number, HTMLDivElement>>({})

  // Center active item
  React.useEffect(() => {
    if (activeItem && itemRefs.current[activeItem.key]) {
      const activeElement = itemRefs.current[activeItem.key]
      const container = scrollContainerRef.current

      if (container) {
        const itemOffset = activeElement.offsetTop
        const itemHeight = activeElement.offsetHeight
        const containerHeight = container.clientHeight

        // Center the active item in the visible area
        const scrollTarget = itemOffset - (containerHeight - itemHeight) / 2
        container.scrollTop = Math.max(0, scrollTarget)
      }
    }
  }, [activeItem])

  const handleItemClick: (item: ContextualMenuItem) => void = React.useCallback(
    (item: ContextualMenuItem) => {
      onClick(item)
    },
    [onClick],
  )

  const baseClassName = clsx(
    "max-w-[331px] p-4",
    "border-gradient border-color-gradient",
    "bg-surface-tertiary rounded-4 shadow-[0_14px_34px_0_rgba(0,0,0,0.4)]",
    width,
  )

  return (
    <div className={baseClassName}>
      <div
        ref={scrollContainerRef}
        className="flex max-h-39 flex-col items-start"
        style={{ overflowY: "overlay" }}
      >
        {items.map((item, index) => (
          <div
            key={item.key}
            ref={(el) => {
              if (el) itemRefs.current[item.key] = el
            }}
            className="w-full"
          >
            <ListItem
              {...normalizeItem(
                item,
                index < items.length - 1,
                handleItemClick,
                hideAmount,
              )}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContextualMenu
