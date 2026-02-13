import type { TooltipContentProps } from "recharts"

type ChartTooltipProps = Partial<TooltipContentProps<number, string>> & {
  hasEntryColor?: boolean
  labelFormatter?: (label: number | string) => string
  tickFormatter?: (value: number | string) => string
}

export function ChartTooltip({
  hasEntryColor = true,
  labelFormatter,
  tickFormatter,
  ...props
}: ChartTooltipProps) {
  const { payload, label } = props

  if (!payload || !payload.length) {
    return false
  }

  const visiblePayload = payload?.filter((item) => {
    if (item.type === "none") return false
    if (item.hide) return false
    if (item.inactive) return false
    return true
  })

  return (
    <div className="rounded-4 border-border-primary bg-surface-secondary flex w-[220px] max-w-[220px] flex-col gap-12 border p-12">
      <p className="text-xxs text-primary">
        {labelFormatter && label ? labelFormatter(label) : label}
      </p>
      {visiblePayload.map((entry, index: number) => (
        <div key={index} className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            {hasEntryColor && (
              <div
                className="h-10 w-10 shrink-0 rounded-full"
                style={{ backgroundColor: entry.stroke }}
              />
            )}
            <p className="text-xxs text-primary">
              {entry.name ?? entry.dataKey}
            </p>
          </div>
          <p className="text-xxs text-primary font-medium">
            {tickFormatter ? tickFormatter(entry.value) : entry.value}
          </p>
        </div>
      ))}
    </div>
  )
}
