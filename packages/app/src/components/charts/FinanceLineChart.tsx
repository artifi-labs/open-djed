import React, { useState } from "react"
import { LineChart } from "@/components/charts/line-chart/LineChart"
import { Legend, Line, Tooltip } from "recharts"
import { ChartLegend } from "@/components/charts/legend/ChartLegend"
import { dateFormatter, UsdFormatter } from "@/components/charts/utils"
import { ChartTooltip } from "@/components/charts/tooltips/ChartTooltip"
import type { ChartData } from "recharts/types/state/chartDataSlice"

type FinanceLineChartProps = {
  title?: string
  data: ChartData | undefined
  xKey: string
  lines: {
    dataKey: string
    name: string
    stroke: string
    hide?: boolean
  }[]
  xTickFormatter?: (value: number | string) => string
  yTickFormatter?: (value: number | string) => string
}

export const FinanceLineChart: React.FC<FinanceLineChartProps> = ({
  title = "",
  data,
  xKey,
  lines,
  xTickFormatter,
  yTickFormatter,
}) => {
  const [hiddenLines, setHiddenLines] = useState<Record<string, boolean>>({})

  const toggleLine = (dataKey: string) => {
    setHiddenLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }))
  }

  const defaultXTickFormatter = xTickFormatter || dateFormatter
  const defaultYTickFormatter = yTickFormatter || UsdFormatter

  return (
    <div className="flex flex-col gap-24 font-medium">
      <p className="text-md text-primary">{title}</p>
      <LineChart
        data={data ? [...data] : undefined}
        xKey={xKey}
        margin={{ top: 22, right: 22, left: 22, bottom: 0 }}
        yTickFormatter={defaultYTickFormatter}
        xTickFormatter={defaultXTickFormatter}
      >
        <Legend
          content={
            <ChartLegend onToggle={toggleLine} hiddenLines={hiddenLines} />
          }
          verticalAlign="top"
          wrapperStyle={{ left: 0, width: "100%", top: 0 }}
        />

        <Tooltip
          content={
            <ChartTooltip
              tickFormatter={defaultYTickFormatter}
              labelFormatter={(value) => dateFormatter(value)}
            />
          }
        />

        {lines.map((line) => (
          <Line
            key={line.dataKey}
            strokeWidth={2}
            dot={false}
            hide={hiddenLines[line.dataKey]}
            activeDot={{ stroke: "transparent", r: 3.5 }}
            {...line}
          />
        ))}
      </LineChart>
    </div>
  )
}
