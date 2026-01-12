"use client"
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface AreaSeries {
  name?: string
  dataKey: string
  strokeColor?: string
  fillColor?: string
  fillOpacity?: number
  hideOnDuplicate?: boolean
  tag?: string
  tooltipLabel?: string
  gradientType?: "linear" | "radial"
  radialGradientColors?: {
    color1?: string
    color2?: string
    color3?: string
    stop1?: number
    stop2?: number
    stop3?: number
    opacity1?: number
    opacity2?: number
    opacity3?: number
  }
}

interface TooltipPayloadEntry {
  dataKey: string
  value: number
  stroke: string
  fill: string
  name: string
  payload: Record<string, unknown>
}
interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
  xKey: string
  tickFormatter?: (value: number) => string
  tooltipFormatter?: (
    value: number,
    dataKey: string,
    payload: Record<string, unknown>,
  ) => string
  areas: AreaSeries[]
}

type MultiAreaChartProps = {
  title?: string
  data: { [key: string]: string | number | undefined }[]
  width?: number | `${number}%`
  graphWidth?: number
  height?: number
  margin?: { top?: number; right?: number; left?: number; bottom?: number }
  xKey: string
  yDomain: [number, number]
  yTicks?: number[]
  interval?: number
  areas: AreaSeries[]
  tickFormatter?: (value: number) => string
  tooltipFormatter?: (
    value: number,
    dataKey: string,
    payload: Record<string, unknown>,
  ) => string
}

const CustomTooltip = ({
  active,
  payload,
  label,
  xKey,
  areas,
  tickFormatter,
  tooltipFormatter,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // filter payload based on hideOnDuplicate flag and tag,
    // avoinding showing multiple labels on tooltip
    const filteredPayload = payload.filter((entry: TooltipPayloadEntry) => {
      if (payload.length === 1) return true

      const areaConfig = areas.find((area) => area.dataKey === entry.dataKey)

      if (!areaConfig?.tag) return true

      const sameTagEntries = payload.filter((p) => {
        const pConfig = areas.find((area) => area.dataKey === p.dataKey)
        return pConfig?.tag === areaConfig.tag
      })

      if (sameTagEntries.length > 1 && areaConfig.hideOnDuplicate) {
        return false
      }

      return true
    })

    return (
      <div className="rounded-4 flex w-fit flex-col gap-4 border p-8">
        <div className="flex flex-row">
          <p className="flex-1 text-sm capitalize">{xKey}</p>
          <p className="text-sm">
            {label ? new Date(label).toLocaleDateString() : ""}
          </p>
        </div>
        {filteredPayload.map((entry: TooltipPayloadEntry, index: number) => (
          <div
            key={index}
            className="flex w-full items-center justify-between gap-8"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.stroke }}
              />
              <p className="text-sm">
                {areas.find((area) => area.dataKey === entry.dataKey)
                  ?.tooltipLabel || entry.name}
              </p>
            </div>
            <p className="text-sm">
              {tooltipFormatter
                ? tooltipFormatter(entry.value, entry.dataKey, entry.payload)
                : tickFormatter
                  ? tickFormatter(entry.value)
                  : entry.value}
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function MultiAreaChart({
  title,
  data,
  width = "100%",
  graphWidth = 24,
  height = 392,
  margin = { top: 10, right: 5, left: 24, bottom: 5 },
  xKey,
  yDomain,
  yTicks,
  interval = 1,
  areas,
  tickFormatter,
  tooltipFormatter,
}: MultiAreaChartProps) {
  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Title */}
      <div className="flex1 text-xs">{title}</div>
      {/* Chart Container */}
      <ResponsiveContainer width={width} height={height}>
        <AreaChart data={data} margin={margin}>
          <defs>
            {areas.map((area, idx) => {
              const gradientType = area.gradientType || "linear"
              const radialColors = area.radialGradientColors

              if (gradientType === "radial" && radialColors) {
                return (
                  <radialGradient
                    id={`grad-${idx}`}
                    key={idx}
                    cx="50%"
                    cy="0%"
                    r="100%"
                  >
                    <stop
                      offset={`${radialColors.stop1 || 0}%`}
                      stopColor={radialColors.color1 || area.fillColor}
                      stopOpacity={
                        radialColors.opacity1 ?? area.fillOpacity ?? 0.1
                      }
                    />
                    <stop
                      offset={`${radialColors.stop2 || 50}%`}
                      stopColor={radialColors.color2 || area.fillColor}
                      stopOpacity={
                        radialColors.opacity2 ?? area.fillOpacity ?? 0.1
                      }
                    />
                    <stop
                      offset={`${radialColors.stop3 || 100}%`}
                      stopColor={
                        radialColors.color3 ||
                        radialColors.color1 ||
                        area.fillColor
                      }
                      stopOpacity={
                        radialColors.opacity3 ?? area.fillOpacity ?? 0.1
                      }
                    />
                  </radialGradient>
                )
              }

              return (
                <linearGradient
                  id={`grad-${idx}`}
                  key={idx}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={area.fillColor}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={area.fillColor}
                    stopOpacity={0}
                  />
                </linearGradient>
              )
            })}
          </defs>

          <CartesianGrid
            strokeDasharray="4"
            vertical={false}
            stroke="#434055"
            opacity={0.4}
          />

          <XAxis
            dataKey={xKey}
            interval={interval}
            axisLine={false}
            tickLine={false}
            tick={{
              dy: 12,
              fontSize: 10,
              fontFamily: "Poppins",
              fill: "var(--color-tertiary)",
              fontWeight: 400,
            }}
            tickFormatter={(value) => {
              const date = new Date(value)
              const month = date.toLocaleString(undefined, { month: "short" })
              const year = date.getFullYear()
              return `${month}, ${year}`
            }}
          />

          <YAxis
            width={graphWidth}
            domain={yDomain}
            ticks={yTicks}
            interval={0}
            tickFormatter={
              tickFormatter
                ? (value) => tickFormatter(value)
                : (value) => `${(value / 1000).toFixed(1)}K`
            }
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              fontFamily: "Poppins",
              fill: "var(--color-tertiary)",
              fontWeight: 400,
            }}
          />

          <Tooltip
            content={
              <CustomTooltip
                xKey={xKey}
                tickFormatter={tickFormatter}
                tooltipFormatter={tooltipFormatter}
                areas={areas}
              />
            }
          />

          {areas.map((area, index) => (
            <Area
              key={index}
              name={area.name || area.dataKey}
              type="linear"
              dataKey={area.dataKey}
              stroke={area.strokeColor}
              strokeWidth={1.5}
              fill={`url(#grad-${index})`}
              fillOpacity={1}
              connectNulls
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
