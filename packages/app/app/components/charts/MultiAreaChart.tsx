'use client'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface AreaSeries {
  name?: string
  dataKey: string
  strokeColor?: string
  fillColor?: string
  fillOpacity?: number
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
  tooltipFormatter?: (value: number, dataKey: string, payload: Record<string, unknown>) => string
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
  tooltipFormatter?: (value: number, dataKey: string, payload: Record<string, unknown>) => string
}

const CustomTooltip = ({
  active,
  payload,
  label,
  xKey,
  tickFormatter,
  tooltipFormatter,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="border-primary bg-light-foreground dark:bg-dark-foreground flex w-[250px] flex-col gap-[4px] rounded-[4px] border p-[8px]">
        <div className="flex flex-row">
          <p className="flex-1 text-sm capitalize">{xKey}</p>
          <p className="text-sm ">{label ? new Date(label).toLocaleDateString() : ''}</p>
        </div>
        {payload.map((entry: TooltipPayloadEntry, index: number) => (
          <div key={index} className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.stroke }} />
              <p className="text-sm ">{entry.name}</p>
            </div>
            <p className="text-sm">
              {tooltipFormatter
                ? tooltipFormatter(entry.value, entry.name, entry.payload)
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
  width = '100%',
  graphWidth,
  height = 392,
  margin = { top: 10, right: 24, left: 24, bottom: 10 },
  xKey,
  yDomain,
  yTicks,
  interval = 1,
  areas,
  tickFormatter,
  tooltipFormatter,
}: MultiAreaChartProps) {
  return (
    <div className="flex h-full w-full flex-col gap-[24px]">
      {/* Title and Legend Row */}
      <div className="flex flex-col items-start justify-between gap-4 lg:items-start xl:flex-row">
        <h3 className="text-primary flex-1 text-lg font-medium xl:mr-8 xl:flex-none">{title}</h3>

        {/*Chart Labels*/}
        <div style={{ paddingLeft: margin.left, paddingRight: margin.right }}>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2">
            {areas.map((area, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: area.strokeColor }} />
                <span>{area.name || area.dataKey}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <ResponsiveContainer width={width} height={height}>
        <AreaChart data={data} margin={margin}>
          <defs>
            {areas.map((area, idx) => (
              <linearGradient id={`grad-${idx}`} key={idx} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={area.fillColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={area.fillColor} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3" vertical={false} stroke="#434055" />

          <XAxis
            dataKey={xKey}
            interval={interval}
            axisLine={false}
            tickLine={false}
            tick={{ dy: 12, fontSize: 12, fontFamily: 'Poppins', fill: '#D0D0D0', fontWeight: 400 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />

          <YAxis
            width={graphWidth}
            domain={yDomain}
            ticks={yTicks}
            interval={0}
            tickFormatter={tickFormatter}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontFamily: 'Poppins', fill: '#D0D0D0', fontWeight: 400 }}
          />

          <Tooltip
            content={
              <CustomTooltip xKey={xKey} tickFormatter={tickFormatter} tooltipFormatter={tooltipFormatter} />
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
