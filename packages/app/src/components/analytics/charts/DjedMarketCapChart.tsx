import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { type Currency } from "../useAnalyticsData"
import { Legend } from "recharts"
import { ChartLegend } from "@/components/charts/legend/ChartLegend"
import { formatAxisValue } from "@/utils"
import { useTranslations } from "next-intl"
import { type MarketCapResponse } from "@open-djed/api"

type DjedMarketCapChartProps = {
  title?: string
  data: MarketCapResponse
  currency: Currency
}

export const DjedMarketCapChart: React.FC<DjedMarketCapChartProps> = ({
  data,
  currency,
}) => {
  const t = useTranslations()
  const valueKey = currency.value === "USD" ? "usdValue" : "adaValue"

  const yTickFormatter = (value: number | string) =>
    currency.value === "USD"
      ? `$${formatAxisValue(Number(value))}`
      : `₳${formatAxisValue(Number(value))}`

  const lines = [
    {
      dataKey: valueKey,
      name:
        currency.value === "USD"
          ? t("common.currencyValue", { currency: "USD" })
          : t("common.currencyValue", { currency: "ADA" }),
      stroke:
        currency.value === "USD"
          ? "var(--color-supportive-1-500)"
          : "var(--color-supportive-2-500)",
    },
  ]

  return (
    <FinancialAreaChart
      data={data}
      xKey="timestamp"
      lines={lines}
      yTickFormatter={yTickFormatter}
    >
      <Legend
        content={<ChartLegend />}
        verticalAlign="top"
        wrapperStyle={{ left: 0, width: "100%", top: 0 }}
      />
    </FinancialAreaChart>
  )
}
