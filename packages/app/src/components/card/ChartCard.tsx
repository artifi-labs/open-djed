import { type ContextualMenuItem } from "../ContextualMenu"
import DropdownButton from "../DropdownButton"
import BaseCard from "./BaseCard"

interface ChartCardProps<T extends string> {
  children?: React.ReactNode
  period?: T
  periodItems?: T[]
  onPeriodChange?: (period: T) => void
}

export default function ChartCard<T extends string>({
  children,
  period,
  periodItems = [],
  onPeriodChange,
}: ChartCardProps<T>) {
  const menuItems: ContextualMenuItem[] = periodItems.map((item) => ({
    key: item,
    text: item,
    onClick: () => onPeriodChange?.(item),
  }))

  const handlePeriodChange = (item: ContextualMenuItem) => {
    const selectedPeriod = item.text
    if (onPeriodChange !== undefined) onPeriodChange(selectedPeriod as T)
  }

  return (
    <BaseCard>
      {period && periodItems && onPeriodChange && (
        <div className="inline-flex w-full justify-end">
          <DropdownButton
            size="small"
            text={period as string}
            activeItem={{
              key: period,
              text: period,
            }}
            menuItems={menuItems}
            onChange={handlePeriodChange}
          />
        </div>
      )}
      {children}
    </BaseCard>
  )
}
