import { formatNumber } from "@/utils"
import Tooltip from "../tooltip/Tooltip"
import { useTranslations } from "next-intl"

interface ReserveGraphProps {
  currentRatio: number | undefined
  minRatio: number | undefined
  maxRatio: number | undefined
}

export function ReserveGraph({
  currentRatio,
  minRatio,
  maxRatio,
}: ReserveGraphProps) {
  const t = useTranslations()
  const currentRatioValue =
    currentRatio !== undefined ? currentRatio / 100 : undefined
  const minRatioValue = minRatio !== undefined ? minRatio / 100 : undefined
  const maxRatioValue = maxRatio !== undefined ? maxRatio / 100 : undefined

  const reserves = [
    {
      label: t("common.min"),
      value: minRatioValue,
      position: "top-full mt-1",
      style: "w-2 h-18 bg-primary rounded-full",
    },
    {
      label: t("common.max"),
      value: maxRatioValue,
      position: "top-full mt-1",
      style: "w-2 h-18 bg-primary rounded-full",
    },
    {
      label: t("common.current"),
      value: currentRatioValue,
      position: "bottom-full mb-1",
      style:
        "h-[18px] w-[18px] rounded-full bg-gradient-angular-2 border border-[var(--color-border-secondary)]",
      tooltipModalClass: "py-4",
    },
  ]

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="relative h-6 w-full overflow-visible rounded-lg">
        <div className="absolute top-1/2 left-0 z-10 flex h-3 w-full -translate-y-1/2 overflow-hidden rounded-lg">
          <div
            className="bg-border-primary rounded-l-full transition-all duration-300 ease-in-out"
            style={{
              width: `${minRatioValue !== undefined ? (minRatioValue / 10) * 100 : 0}%`,
            }}
          />
          <div
            className="bg-gradient-angular-2 transition-all duration-300 ease-in-out"
            style={{
              width: `${maxRatioValue !== undefined && minRatioValue !== undefined ? ((maxRatioValue - minRatioValue) / 10) * 100 : 0}%`,
            }}
          />
          <div
            className="bg-border-primary rounded-r-full transition-all duration-300 ease-in-out"
            style={{
              width: `${100 - (maxRatioValue !== undefined ? (maxRatioValue / 10) * 100 : 0)}%`,
            }}
          />
        </div>
        {reserves.map(
          ({ label, value, position, style, tooltipModalClass }, index) =>
            value !== undefined && (
              <div
                key={index}
                className="group absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform"
                style={{
                  left: `${value !== undefined ? (value / 10) * 100 : 0}%`,
                }}
              >
                <Tooltip
                  text={`${formatNumber(Math.round((value !== undefined ? value : 0) * 100), { minimumFractionDigits: 0 })}%`}
                  tooltipModalClass={tooltipModalClass || ""}
                >
                  <div className="relative flex flex-col items-center justify-center">
                    <div className={style} />
                    <div
                      className={`text-secondary text-xxs absolute ${position} transition-transform group-hover:scale-110`}
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
