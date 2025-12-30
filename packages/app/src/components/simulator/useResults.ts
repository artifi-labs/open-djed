import { useMemo } from "react"
import { formatNumber } from "@/lib/utils"

export type ResultValueItem = {
  topValue: string
  bottomValue: string
  isTotal?: boolean
}

export type ResultItem = {
  label: string
  values: ResultValueItem[]
}

interface ResultsData {
  buyFee: number
  sellFee: number
  stakingRewards: number
  feesEarned: number
  adaPnl: number
  adaPnlPercent: number
  totalPnl: number
  totalPnlPercent: number
}

type FormatType = "currency" | "percent"

interface ResultSectionConfig {
  label: string
  read: (data: Partial<ResultsData>) => { main: number; sub: number }
  formatType: FormatType
  isTotal?: boolean
  labelClassName?: string
}

const formatMainValue = (value: number): string => {
  return formatNumber(value, { maximumFractionDigits: 2 })
}

const formatSubValue = (value: number, type: FormatType): string => {
  const formatted = formatNumber(value, { maximumFractionDigits: 2 })
  return type === "percent" ? `${formatted}%` : `$${formatted}`
}

const createSectionConfigs = (): ResultSectionConfig[] => [
  {
    label: "Buy Fee",
    read: (d) => ({ main: d.buyFee ?? 0, sub: d.buyFee ?? 0 }),
    formatType: "currency",
  },
  {
    label: "Sell Fee",
    read: (d) => ({ main: d.sellFee ?? 0, sub: d.sellFee ?? 0 }),
    formatType: "currency",
  },
  {
    label: "ADA Staking Rewards",
    read: (d) => ({ main: d.stakingRewards ?? 0, sub: d.stakingRewards ?? 0 }),
    formatType: "currency",
  },
  {
    label: "Buy/Sell Fees Earned",
    read: (d) => ({ main: d.feesEarned ?? 0, sub: d.feesEarned ?? 0 }),
    formatType: "currency",
  },
  {
    label: "ADA PNL",
    read: (d) => ({ main: d.adaPnl ?? 0, sub: d.adaPnlPercent ?? 0 }),
    formatType: "percent",
  },
  {
    label: "Total PNL",
    read: (d) => ({ main: d.totalPnl ?? 0, sub: d.totalPnlPercent ?? 0 }),
    formatType: "percent",
    isTotal: true,
  },
]

export function useResults(data: Partial<ResultsData> | undefined) {
  return useMemo((): ResultItem[] => {
    const configs = createSectionConfigs()
    const safeData = data ?? {}

    return configs.map((section) => {
      const values = section.read(safeData)

      return {
        label: section.label,
        values: [
          {
            topValue: formatMainValue(values.main),
            bottomValue: formatSubValue(values.sub, section.formatType),
            isTotal: section.isTotal,
          },
        ],
      }
    })
  }, [data])
}
