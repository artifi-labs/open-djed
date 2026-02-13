import React, { useState } from "react"
import { Area, Legend, Line, Tooltip } from "recharts"
import { ChartLegend } from "@/components/charts/legend/ChartLegend"
import { dateFormatter, UsdFormatter } from "@/components/charts/utils"
import { ChartTooltip } from "@/components/charts/tooltips/ChartTooltip"
import type { ChartData } from "recharts/types/state/chartDataSlice"
import type { AxisTick } from "recharts/types/util/types"
import { AreaChart } from "./area-chart/AreaChart"

type FinancialAreaChartProps = {
  title?: string
  data: ChartData | undefined
  xKey: string
  lines?: {
    dataKey: string
    name: string
    stroke: string
    hide?: boolean
  }[]
  xTickFormatter?: (value: number | string) => string
  yTickFormatter?: (value: number | string) => string
  yTicks?: AxisTick[]
  children?: React.ReactNode
}

export const FinancialAreaChart: React.FC<FinancialAreaChartProps> = ({
  title = "",
  data,
  xKey,
  lines,
  xTickFormatter,
  yTickFormatter,
  yTicks,
  children,
}) => {
  const childrenArray = React.Children.toArray(children)
  const [hiddenLines, setHiddenLines] = useState<Record<string, boolean>>({})

  const hasLines = childrenArray.some(
    (child) => React.isValidElement(child) && child.type === Line,
  )

  const hasLegend = childrenArray.some(
    (child) => React.isValidElement(child) && child.type === Legend,
  )

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
      <AreaChart
        data={data ? [...data] : undefined}
        xKey={xKey}
        margin={{ top: 22, right: 22, left: 22, bottom: 0 }}
        yTickFormatter={defaultYTickFormatter}
        xTickFormatter={defaultXTickFormatter}
        yTicks={yTicks}
      >
        {!hasLegend && (
          <Legend
            content={
              <ChartLegend onToggle={toggleLine} hiddenLines={hiddenLines} />
            }
            verticalAlign="top"
            wrapperStyle={{ left: 0, width: "100%", top: 0 }}
          />
        )}

        <Tooltip
          content={
            <ChartTooltip
              tickFormatter={defaultYTickFormatter}
              labelFormatter={(value) => dateFormatter(value)}
              hasEntryColor={false}
            />
          }
        />

        <defs>
          <radialGradient
            id="lineAreaGradient"
            cx="-0.65%"
            cy="67.17%"
            r="142.05%"
            fx="-0.65%"
            fy="67.17%"
          >
            <stop offset="0%" stopColor="#F3F4F6" stopOpacity={0.03} />
            <stop
              offset="1.17%"
              stopColor="rgba(21, 162, 183, 0)"
              stopOpacity={0.03}
            />
            <stop offset="100%" stopColor="#F3F4F6" stopOpacity={0.03} />
          </radialGradient>
        </defs>

        {!hasLines &&
          lines?.map((line) => (
            <React.Fragment key={line.dataKey}>
              <Line
                key={line.dataKey}
                strokeWidth={2}
                dot={false}
                hide={hiddenLines[line.dataKey]}
                activeDot={{ stroke: "transparent", r: 3.5 }}
                {...line}
              />

              <Area
                type="linear"
                dataKey={line.dataKey}
                stroke="none"
                fill="url(#lineAreaGradient)"
                baseValue="dataMin"
                dot={false}
                activeDot={false}
                legendType="none"
                tooltipType="none"
              />
            </React.Fragment>
          ))}

        {children}
      </AreaChart>
    </div>
  )
}
