import {
  LineChart as BaseLineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type LineProps as BaseLineProps,
} from "recharts"
import React from "react"
import type { Percent } from "recharts/types/util/types"
import { ChartLegend } from "../legend/ChartLegend"
import { ChartTooltip } from "../tooltips/ChartTooltip"

type LineChartProps = {
  title?: string
  chartContainerClassName?: string
  xKey?: string
  margin?: { top: number; right: number; left: number; bottom: number }
  yTickFormatter?: (value: number | string) => string
  xTickFormatter?: (value: number | string) => string
  children?: React.ReactNode
  width?: Percent | number
  height?: Percent | number
} & Omit<BaseLineProps, "children">

export function LineChart({
  title,
  data,
  width = "100%",
  height = 304,
  margin = { top: 6, right: 12, left: 12, bottom: 6 },
  chartContainerClassName,
  xKey = "x",
  yTickFormatter,
  xTickFormatter,
  children,
}: LineChartProps) {
  const childrenArray = React.Children.toArray(children)
  const hasCartesianGrid = childrenArray.some(
    (child) => React.isValidElement(child) && child.type === CartesianGrid,
  )
  const hasXAxis = childrenArray.some(
    (child) => React.isValidElement(child) && child.type === XAxis,
  )
  const hasYAxis = childrenArray.some(
    (child) => React.isValidElement(child) && child.type === YAxis,
  )
  const hasTooltip = childrenArray.some(
    (child) => React.isValidElement(child) && child.type === Tooltip,
  )
  const hasLegend = childrenArray.some(
    (child) => React.isValidElement(child) && child.type === Legend,
  )

  return (
    <div
      className={chartContainerClassName ?? "flex h-full w-full flex-col gap-6"}
    >
      {title && <div className="flex1 text-xs">{title}</div>}

      <ResponsiveContainer width={width} height={height}>
        <BaseLineChart data={data} margin={margin}>
          {!hasCartesianGrid && (
            <CartesianGrid
              strokeDasharray="3"
              vertical={false}
              stroke="var(--color-border-secondary)"
              opacity={0.4}
            />
          )}

          {!hasXAxis && (
            <XAxis
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              minTickGap={5}
              padding={{ left: 5, right: 5 }}
              tick={{
                dy: 12,
                fontSize: 10,
                fontFamily: "Poppins",
                fill: "var(--color-tertiary)",
                fontWeight: 400,
              }}
              tickFormatter={xTickFormatter}
            />
          )}

          {!hasYAxis && (
            <YAxis
              width={24}
              axisLine={false}
              tickLine={false}
              tickFormatter={yTickFormatter}
              tick={{
                fontSize: 10,
                fontFamily: "Poppins",
                fill: "var(--color-tertiary)",
                fontWeight: 400,
              }}
            />
          )}

          {!hasTooltip && <Tooltip content={<ChartTooltip />} />}

          {!hasLegend && (
            <Legend
              content={<ChartLegend />}
              verticalAlign="top"
              wrapperStyle={{ left: 0 }}
            />
          )}

          {children}
        </BaseLineChart>
      </ResponsiveContainer>
    </div>
  )
}
