"use client"
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import Icon from "../../icons/Icon"

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
  label: string
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
  yDomain?: [number, number]
  yTicks?: number[]
  xTicks?: Array<string | number>
  interval?: number
  areas: AreaSeries[]
  xTickFormatter?: (value: string | number, index?: number) => string
  tickFormatter?: (value: number) => string
  tooltipFormatter?: (
    value: number,
    dataKey: string,
    payload: Record<string, unknown>,
  ) => string
  showLegend?: boolean
}

const CustomTooltip = ({
  active,
  payload,
  label,
  areas,
  tickFormatter,
  tooltipFormatter,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // filter payload based on hideOnDuplicate flag and tag,
    // avoiding showing multiple labels on tooltip
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

    const formatTooltipDate = (label: string) => {
      if (!label) return ""
      const d = new Date(label)
      if (Number.isNaN(d.getTime())) return String(label)

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    return (
      <div className="rounded-4 border-border-primary bg-surface-secondary flex w-79 max-w-full flex-col gap-12 border p-12">
        <div className="flex flex-row">
          <p className="text-xxs">{formatTooltipDate(label)}</p>
        </div>
        {filteredPayload.map((entry: TooltipPayloadEntry, index: number) => (
          <div
            key={index}
            className="flex w-full items-center justify-between gap-12"
          >
            <div className="flex items-center">
              <div style={{ backgroundColor: entry.stroke }} />
              <p className="text-xxs">
                {areas.find((area) => area.dataKey === entry.dataKey)
                  ?.tooltipLabel || entry.name}
              </p>
            </div>
            <p className="text-xxs">
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

const DotMarker = ({ cx, cy }: { cx?: number; cy?: number }) => {
  const size = 6
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null

  return (
    <foreignObject
      x={(cx as number) - size / 2}
      y={(cy as number) - size / 2}
      width={size}
      height={size}
    >
      <Icon name="Ellipse" size={size} />
    </foreignObject>
  )
}

export function MultiAreaChart({
  title,
  data,
  width = "100%",
  graphWidth = 24,
  height = 304,
  margin = { top: 6, right: 12, left: 12, bottom: 6 },
  xKey,
  yDomain,
  yTicks,
  interval = 1,
  areas,
  tickFormatter,
  xTickFormatter,
  tooltipFormatter,
  showLegend = false,
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

              if (gradientType === "radial") {
                const color1 =
                  radialColors?.color1 ||
                  "var(--color-supportive-3-25, #f3f4f6)"
                const color2 =
                  radialColors?.color2 ||
                  area.fillColor ||
                  "var(--color-supportive-3-500, #15a2b7)"
                const color3 =
                  radialColors?.color3 ||
                  radialColors?.color1 ||
                  "var(--color-supportive-3-25, #f3f4f6)"
                const stop1 = radialColors?.stop1 ?? 0
                const stop2 = radialColors?.stop2 ?? 50
                const stop3 = radialColors?.stop3 ?? 100
                const opacity1 =
                  radialColors?.opacity1 ?? area.fillOpacity ?? 0.1
                const opacity2 =
                  radialColors?.opacity2 ?? area.fillOpacity ?? 0.1
                const opacity3 =
                  radialColors?.opacity3 ?? area.fillOpacity ?? 0.1

                return (
                  <radialGradient
                    id={`grad-${idx}`}
                    key={idx}
                    cx="50%"
                    cy="0%"
                    r="100%"
                  >
                    <stop
                      offset={`${stop1}%`}
                      stopColor={color1}
                      stopOpacity={opacity1}
                    />
                    <stop
                      offset={`${stop2}%`}
                      stopColor={color2}
                      stopOpacity={opacity2}
                    />
                    <stop
                      offset={`${stop3}%`}
                      stopColor={color3}
                      stopOpacity={opacity3}
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
            strokeDasharray="3"
            vertical={false}
            stroke="var(--color-border-secondary)"
            opacity={0.4}
          />

          <XAxis
            dataKey={xKey}
            interval={interval}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
            padding={{ left: 10, right: 20 }}
            tick={{
              dy: 12,
              fontSize: 10,
              fontFamily: "Poppins",
              fill: "var(--color-tertiary)",
              fontWeight: 400,
            }}
            tickFormatter={(value, index) =>
              xTickFormatter ? xTickFormatter(value, index) : value
            }
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
                label=""
                tickFormatter={tickFormatter}
                tooltipFormatter={tooltipFormatter}
                areas={areas}
              />
            }
          />

          {showLegend && (
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: "20px",
                fontSize: "12px",
                fontFamily: "Poppins",
              }}
            />
          )}

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
              dot={false}
              activeDot={<DotMarker />}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
