import { FinanceLineChart } from "@/components/charts/FinanceLineChart"
import { type ReserveRatioChartEntry } from "../useAnalyticsData"
import { type DotProps, Line, ReferenceArea, ReferenceLine } from "recharts"
import React from "react"

type ReserveRatioOverTimeChartProps = {
  data: ReserveRatioChartEntry[]
}

export const ReserveRatioOverTimeChart: React.FC<
  ReserveRatioOverTimeChartProps
> = ({ data }) => {
  const yTickFormatter = (value: number | string) =>
    `${Number(value).toFixed(0)}%`

  const minReserveRatio = 400
  const maxReserveRatio = 800
  const referenceLineStrokeColor = "var(--color-supportive-2-500)"
  const maxMinColor = "#ff0000"
  const baseLineColor = "var(--color-supportive-2-500)"

  const values = data.map((d) => d.reserveRatio ?? 0)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const range = dataMax - dataMin

  const minThresholdPercent = ((dataMax - minReserveRatio) / range) * 100
  const maxThresholdPercent = ((dataMax - maxReserveRatio) / range) * 100

  type DataPoint = (typeof data)[0]
  interface CustomDotProps extends DotProps {
    payload?: DataPoint
    dataKey?: string
    value?: number
  }

  const ConditionalDot = (props: CustomDotProps) => {
    const { cx, cy, payload } = props

    if (!cx || !cy || !payload) return null

    const value = payload.reserveRatio ?? 0

    let color = "var(--color-supportive-2-500)"
    if (value < minReserveRatio || value > maxReserveRatio) {
      color = maxMinColor
    }

    return <circle cx={cx} cy={cy} r={4} fill={color} strokeWidth={2} />
  }

  const lines = [
    {
      dataKey: "reserveRatio",
      name: "Reserve Ratio",
    },
  ]

  const referenceAreas = [
    {
      y1: minReserveRatio,
      y2: maxReserveRatio,
      fill: "var(--color-gradient-angular-2)",
      fillOpacity: 0.05,
    },
  ]

  return (
    <FinanceLineChart
      data={data}
      xKey="timestamp"
      yTickFormatter={yTickFormatter}
      yTicks={[0, 200, 400, 600, 800, 1000, 1200]}
    >
      <defs>
        <linearGradient id="splitColorGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={maxMinColor} />
          <stop offset={`${maxThresholdPercent}%`} stopColor={maxMinColor} />

          <stop offset={`${maxThresholdPercent}%`} stopColor={baseLineColor} />
          <stop offset={`${minThresholdPercent}%`} stopColor={baseLineColor} />

          <stop offset={`${minThresholdPercent}%`} stopColor={maxMinColor} />
          <stop offset="100%" stopColor={maxMinColor} />
        </linearGradient>
      </defs>

      {referenceAreas.map((area, index) => (
        <React.Fragment key={index}>
          <ReferenceArea
            y1={area.y1}
            y2={area.y2}
            fill={area.fill}
            fillOpacity={area.fillOpacity}
          />

          <ReferenceLine
            y={area.y1}
            stroke={referenceLineStrokeColor}
            strokeWidth={1}
          />
          <ReferenceLine
            y={area.y2}
            stroke={referenceLineStrokeColor}
            strokeWidth={1}
          />
        </React.Fragment>
      ))}

      {lines.map((line) => (
        <Line
          key={line.dataKey}
          strokeWidth={2}
          stroke="url(#splitColorGradient)"
          dot={false}
          activeDot={<ConditionalDot />}
          {...line}
        />
      ))}
    </FinanceLineChart>
  )
}
