import { formatNumber } from "@/lib/utils"
import Tooltip from "./tooltip/Tooltip"

interface ReserveGraphProps {
  currentRatio: number
  minRatio: number
  maxRatio: number
}

export function ReserveGraph({
  currentRatio,
  minRatio,
  maxRatio,
}: ReserveGraphProps) {
  const currentRatioValue = currentRatio / 100
  const minRatioValue = minRatio / 100
  const maxRatioValue = maxRatio / 100

  const reserves = [
    {
      label: "Min",
      value: minRatioValue,
      position: "top-full mt-1",
      style: "w-1 h-5 bg-black dark:bg-white",
    },
    {
      label: "Max",
      value: maxRatioValue,
      position: "top-full mt-1",
      style: "w-1 h-5 bg-black dark:bg-white",
    },
    {
      label: "Current",
      value: currentRatioValue,
      position: "bottom-full mb-1",
      style:
        "w-5 h-5 rounded-full border-2 border-black bg-white dark:bg-black dark:border-white",
      tooltipModalClass: "py-4",
    },
  ]

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="relative h-6 w-full overflow-visible rounded-lg">
        <div className="absolute top-1/2 left-0 z-10 flex h-3 w-full -translate-y-1/2 overflow-hidden rounded-lg">
          <div
            className="bg-gradient-angular-1 rounded-l-lg transition-all duration-300 ease-in-out"
            style={{ width: `${(minRatioValue / 10) * 100}%` }}
          />
          <div
            className="bg-brand-primary transition-all duration-300 ease-in-out"
            style={{
              width: `${((maxRatioValue - minRatioValue) / 10) * 100}%`,
            }}
          />
          <div
            className="bg-gradient-angular-2 rounded-r-lg transition-all duration-300 ease-in-out"
            style={{ width: `${100 - (maxRatioValue / 10) * 100}%` }}
          />
        </div>
        {reserves.map(
          ({ label, value, position, style, tooltipModalClass }, index) => (
            <div
              key={index}
              className="group absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform"
              style={{ left: `${(value / 10) * 100}%` }}
            >
              <Tooltip
                text={`${formatNumber(Math.round(value * 100), { minimumFractionDigits: 0 })}%`}
                style={{ display: "contents" }}
                tooltipModalClass={tooltipModalClass || ""}
              >
                <div className="relative flex flex-col items-center justify-center">
                  <div className={style} />
                  <div
                    className={`absolute text-xs font-semibold text-black dark:text-white ${position} transition-transform group-hover:scale-110`}
                  >
                    {label}
                  </div>
                </div>
              </Tooltip>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
