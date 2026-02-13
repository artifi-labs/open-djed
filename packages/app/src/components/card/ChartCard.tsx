import type { Currency, ChartPeriod } from "../analytics/useAnalyticsData"
import { type ContextualMenuItem } from "../ContextualMenu"
import { type ReserveBoundsType } from "../dashboard/useMintBurnAction"
import Dropdown from "../Dropdown"
import Icon from "../icons/Icon"
import BaseCard from "./BaseCard"

type WarningBannerProps = {
  message: string
  type: "error" | "warning"
}

type InfoBannerProps = {
  currentRatio: number
  percentage: number
  type: Exclude<ReserveBoundsType, "in-bounds">
}

type ChartCardProps = {
  children?: React.ReactNode
  period?: ChartPeriod
  periodItems?: ChartPeriod[]
  onPeriodChange?: (period: ChartPeriod) => void
  currency?: Currency
  currencyItems?: Currency[]
  onCurrencyChange?: (currency: Currency) => void
  title?: string
  warning?: WarningBannerProps
  info?: InfoBannerProps
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  message,
  type,
}) => (
  <div className={`flex flex-row items-center gap-8`}>
    <Icon
      name={"Information"}
      size={16}
      iconColor={type === "error" ? "text-error-text" : "text-warning-text"}
    />
    <p
      className={`text-xs ${type === "error" ? "text-error-text" : "text-warning-text"}`}
    >
      {message}
    </p>
  </div>
)

export const InfoBanner: React.FC<InfoBannerProps> = ({
  currentRatio,
  percentage,
  type,
}) => (
  <div className="flex flex-row items-center gap-8">
    <div className="flex flex-row items-center gap-6">
      <p className="text-tertiary text-[10px]">Current ratio:</p>
      <p className="desktop:text-base test-sm font-semibold">{currentRatio}%</p>
    </div>

    <div className="flex flex-row gap-2">
      <Icon
        name={type === "below" ? "Arrow-Down" : "Arrow-Top"}
        size={16}
        iconColor={type === "below" ? "text-error-text" : "text-success-text"}
      />
      <p
        className={`text-xs ${type === "below" ? "text-error-text" : "text-success-text"}`}
      >
        {percentage}% {type === "below" ? "below" : "above"}{" "}
        {type === "below" ? "minimum" : "maximum"}
      </p>
    </div>
  </div>
)

export default function ChartCard({
  children,
  period,
  periodItems = [],
  currency,
  currencyItems = [],
  onPeriodChange,
  onCurrencyChange,
  title,
  warning,
  info,
}: ChartCardProps) {
  const periodMenuItems: ContextualMenuItem[] = periodItems.map((item) => ({
    key: item.value,
    text: item.label,
    onClick: () => onPeriodChange?.(item),
  }))

  const currencyMenuItems: ContextualMenuItem[] = currencyItems.map((item) => ({
    key: item.value,
    text: item.label,
    onClick: () => onCurrencyChange?.(item),
  }))

  const handleCurrencyChange = (item: ContextualMenuItem) => {
    const selectedCurrency = currencyItems.find((c) => c.value === item.key)
    if (selectedCurrency !== undefined) onCurrencyChange?.(selectedCurrency)
  }

  const handlePeriodChange = (item: ContextualMenuItem) => {
    const selectedPeriod = periodItems.find((p) => p.value === item.key)
    if (selectedPeriod !== undefined) onPeriodChange?.(selectedPeriod)
  }

  return (
    <BaseCard border="border-1 border-border-primary">
      <div className="desktop:flex-row desktop:items-center desktop:justify-between flex w-full flex-col items-start justify-start gap-12">
        <div className="desktop:flex-row desktop:items-center flex w-full flex-col items-start justify-between gap-12">
          <div className="desktop:flex-row desktop:items-center desktop:gap-12 flex flex-col items-start gap-8">
            {title && <span className="text-base font-medium">{title}</span>}
            {warning && (
              <WarningBanner message={warning.message} type={warning.type} />
            )}
          </div>
          {info && (
            <InfoBanner
              currentRatio={info.currentRatio}
              percentage={info.percentage}
              type={info.type}
            />
          )}
        </div>
        {((currency && currencyItems && onCurrencyChange) ||
          (period && periodItems && onPeriodChange)) && (
          <div className="desktop:w-fit inline-flex w-full items-center justify-end gap-8">
            {currency && currencyItems && onCurrencyChange && (
              <div className="desktop:w-17.75 inline-flex w-full justify-end">
                <Dropdown
                  text={currency.label ?? currency.value}
                  menuItems={currencyMenuItems}
                  onChange={handleCurrencyChange}
                  hasTag={false}
                  trailingIcon="Chevron-down"
                  size="small"
                />
              </div>
            )}

            {period && periodItems && onPeriodChange && (
              <div className="desktop:w-[128px] inline-flex w-full justify-end">
                <Dropdown
                  text={period.label ?? period.value}
                  menuItems={periodMenuItems}
                  onChange={handlePeriodChange}
                  hasTag={false}
                  trailingIcon="Chevron-down"
                  size="small"
                />
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </BaseCard>
  )
}
