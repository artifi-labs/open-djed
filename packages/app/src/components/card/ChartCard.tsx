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

type ChartCardProps<T extends string, U extends string> = {
  children?: React.ReactNode
  period?: T
  periodItems?: T[]
  onPeriodChange?: (period: T) => void
  currency?: U
  currencyItems?: U[]
  onCurrencyChange?: (currency: U) => void
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

export default function ChartCard<T extends string, U extends string>({
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
                  text={currency as string}
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
                  text={period as string}
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
