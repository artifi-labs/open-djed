import { FinancialAreaChart } from "@/components/charts/FinancialAreaChart"
import { type ReserveRatioChartEntry } from "../useAnalyticsData"
import {
  type BarShapeProps,
  type DotProps,
  Legend,
  Line,
  ReferenceArea,
} from "recharts"
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
  const referenceLineStrokeColor = "var(--color-border-secondary)"
  const maxMinColor = "var(--color-alerts-error-text)"
  const baseLineColor = "var(--color-supportive-2-500)"

  const values = data.map((d) => d.reserveRatio ?? 0)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const range = dataMax - dataMin

  const minThresholdPercent =
    range > 0
      ? Math.max(0, Math.min(100, ((dataMax - minReserveRatio) / range) * 100))
      : 50
  const maxThresholdPercent =
    range > 0
      ? Math.max(0, Math.min(100, ((dataMax - maxReserveRatio) / range) * 100))
      : 50

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

    let color = baseLineColor
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
      fill: "url(#referenceGradient)",
      fillOpacity: 0.1,
    },
  ]

  return (
    <FinancialAreaChart
      data={data}
      xKey="timestamp"
      yTickFormatter={yTickFormatter}
      yTicks={[0, 200, 400, 600, 800, 1000, 1200]}
    >
      <Legend content={() => null} />
      <defs>
        <linearGradient id="splitColorGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={maxMinColor} />
          <stop offset={`${maxThresholdPercent}%`} stopColor={maxMinColor} />

          <stop offset={`${maxThresholdPercent}%`} stopColor={baseLineColor} />
          <stop offset={`${minThresholdPercent}%`} stopColor={baseLineColor} />

          <stop offset={`${minThresholdPercent}%`} stopColor={maxMinColor} />
          <stop offset="100%" stopColor={maxMinColor} />
        </linearGradient>

        <linearGradient
          id="referenceGradient"
          x1="0.95"
          y1="0.1"
          x2="0.05"
          y2="0.9"
        >
          <stop offset="1%" stopColor="var(--color-supportive-1-500)" />
          <stop offset="118.71%" stopColor="var(--color-supportive-2-500)" />
        </linearGradient>
      </defs>

      {referenceAreas.map((area, index) => (
        <ReferenceArea
          key={index}
          y1={area.y1}
          y2={area.y2}
          fill={area.fill}
          fillOpacity={area.fillOpacity}
          shape={(props: BarShapeProps) => {
            const { x, y, width, height } = props
            return (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={area.fill}
                  fillOpacity={area.fillOpacity}
                />
                <line
                  x1={x}
                  y1={y}
                  x2={x + width}
                  y2={y}
                  stroke={referenceLineStrokeColor}
                  strokeWidth={1}
                />
                <line
                  x1={x}
                  y1={y + height}
                  x2={x + width}
                  y2={y + height}
                  stroke={referenceLineStrokeColor}
                  strokeWidth={1}
                />
              </g>
            )
          }}
        />
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
    </FinancialAreaChart>
  )
}
