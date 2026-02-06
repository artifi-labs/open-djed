import clsx from "clsx"
import type { LegendPayload } from "recharts"

interface ChartLegendProps {
  title?: string
  payload?: LegendPayload[]
  onToggle?: (dataKey: string) => void
  hiddenLines?: Record<string, boolean>
}

export function ChartLegend({
  title,
  payload,
  onToggle,
  hiddenLines,
}: ChartLegendProps) {
  if (!payload || !payload.length) {
    return null
  }

  const visiblePayload = payload?.filter((item) => {
    if (item.type === "none") return false
    return true
  })

  const handleClick = (entry: LegendPayload) => {
    if (onToggle && entry.dataKey) {
      onToggle(entry.dataKey.toString())
    }
  }

  return (
    <div className="flex flex-row items-start justify-between gap-4 lg:items-start xl:flex-row">
      {title && (
        <h3 className="text-primary flex-1 text-lg font-medium xl:mr-8 xl:flex-none">
          {title}
        </h3>
      )}
      <div className="flex flex-wrap items-center justify-center gap-12">
        {visiblePayload.map((entry, index) => {
          const dataKey = entry.dataKey?.toString() || ""
          const isHidden = hiddenLines?.[dataKey]
          const isClickable = !!onToggle

          return (
            <button
              key={index}
              onClick={() => handleClick(entry)}
              disabled={!isClickable}
              className={clsx(
                "flex min-w-0 items-center gap-4 transition-opacity",
                isClickable && "cursor-pointer",
                isHidden && "cursor-pointer opacity-50",
              )}
            >
              <div
                className="h-[6px] w-[6px] rounded-full"
                style={{
                  backgroundColor: isHidden ? "transparent" : entry.color,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: entry.color,
                  opacity: isHidden ? 0.5 : 1,
                }}
              />
              <span className="text-primary text-xxs truncate">
                {entry.value}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
