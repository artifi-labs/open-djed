"use client"
import React from "react"
import clsx from "clsx"
import Tab, { Radius, TabProps, Variant } from "./Tab"

type Type = "primary" | "secondary" | "outlined"

export type TabItem = {
  key?: string | number
} & Omit<TabProps, "variant" | "size" | "radius">

type TabsProps = {
  type: Type
  items: TabItem[]
  activeItemIndex?: number
  onTabChange?: (item: TabItem, index: number) => void
}

const Tabs: React.FC<TabsProps> = ({
  type,
  items,
  activeItemIndex = 0,
  onTabChange,
}) => {
  const tabAggregatorBaseClasses =
    "flex flex-row p-2 border1 rounded-button bg-surface-primary w-fit"

  const tabAggregatorVariantClasses: Record<
    Type,
    { className?: string; radius: Radius; variant: Variant }
  > = {
    primary: {
      radius: "full",
      variant: "primary",
    },
    secondary: {
      className: "gap-4",
      radius: "4",
      variant: "secondary",
    },
    outlined: {
      className: "gap-4",
      radius: "full",
      variant: "outlined",
    },
  }

  const tabAggregatorClasses = clsx(
    tabAggregatorBaseClasses,
    tabAggregatorVariantClasses[type].className,
  )

  return (
    <div className={tabAggregatorClasses}>
      {items.map((item, index) => {
        const { key, ...itemProps } = item
        return (
          <Tab
            key={item.key || item.text}
            radius={tabAggregatorVariantClasses[type].radius}
            variant={tabAggregatorVariantClasses[type].variant}
            size="small"
            active={index == activeItemIndex}
            onClick={() => onTabChange?.(items[index], index)}
            {...itemProps}
          />
        )
      })}
    </div>
  )
}

export default Tabs
