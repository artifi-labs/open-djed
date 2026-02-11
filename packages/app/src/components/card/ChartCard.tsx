import { type ContextualMenuItem } from "../ContextualMenu"
import DropdownButton from "../DropdownButton"
import BaseCard from "./BaseCard"

interface ChartCardProps<T extends string, U extends string> {
  children?: React.ReactNode
  period?: T
  periodItems?: T[]
  onPeriodChange?: (period: T) => void
  currency?: U
  currencyItems?: U[]
  onCurrencyChange?: (currency: U) => void
}

export default function ChartCard<T extends string, U extends string>({
  children,
  period,
  periodItems = [],
  currency,
  currencyItems = [],
  onPeriodChange,
  onCurrencyChange,
}: ChartCardProps<T, U>) {
  const periodMenuItems: ContextualMenuItem[] = periodItems.map((item) => ({
    key: item,
    text: item,
    onClick: () => onPeriodChange?.(item),
  }))

  const handlePeriodChange = (item: ContextualMenuItem) => {
    const selectedPeriod = item.text
    if (onPeriodChange !== undefined) onPeriodChange(selectedPeriod as T)
  }

  const currencyMenuItems: ContextualMenuItem[] = currencyItems.map((item) => ({
    key: item,
    text: item,
    onClick: () => onCurrencyChange?.(item),
  }))

  const handleCurrencyChange = (item: ContextualMenuItem) => {
    const selectedCurrency = item.text
    if (onCurrencyChange !== undefined) onCurrencyChange(selectedCurrency as U)
  }

  return (
    <BaseCard>
      <div className="flex w-full flex-row items-center justify-end gap-8">
        {period && periodItems && onPeriodChange && (
          <div className="inline-flex justify-end">
            <DropdownButton
              size="small"
              text={period as string}
              activeItem={{
                key: period,
                text: period,
              }}
              menuItems={periodMenuItems}
              onChange={handlePeriodChange}
            />
          </div>
        )}
        {currency && currencyItems && onCurrencyChange && (
          <div className="inline-flex justify-end">
            <DropdownButton
              size="small"
              text={currency as string}
              activeItem={{
                key: currency,
                text: currency,
              }}
              menuItems={currencyMenuItems}
              onChange={handleCurrencyChange}
            />
          </div>
        )}
      </div>
      {children}
    </BaseCard>
  )
}
