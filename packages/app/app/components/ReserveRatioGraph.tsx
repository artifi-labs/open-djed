import { formatNumber } from '~/utils'
import Tooltip from './Tooltip'
import { useTranslation } from 'react-i18next'

interface ReserveRatioGraphProps {
  currentRatio: number
  minRatio: number
  maxRatio: number
}

export function ReserveRatioGraph({ currentRatio, minRatio, maxRatio }: ReserveRatioGraphProps) {
  const { t } = useTranslation()
  
  const reserves = [
    {
      label: t('reserveRatioGraph.min'),
      value: minRatio,
      position: 'top-full mt-1',
      style: 'w-1 h-5 bg-black dark:bg-white',
    },
    {
      label: t('reserveRatioGraph.max'),
      value: maxRatio,
      position: 'top-full mt-1',
      style: 'w-1 h-5 bg-black dark:bg-white',
    },
    {
      label: t('reserveRatioGraph.current'),
      value: currentRatio,
      position: 'bottom-full mb-1',
      style: 'w-5 h-5 rounded-full border-2 border-black bg-white dark:bg-black dark:border-white',
      tooltipModalClass: 'py-4',
    },
  ]

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="relative w-full h-6 rounded-lg overflow-visible">
        <div className="absolute top-1/2 left-0 h-3 w-full flex overflow-hidden z-10 -translate-y-1/2 rounded-lg">
          <div
            className="bg-amber-500 rounded-l-lg transition-all duration-300 ease-in-out"
            style={{ width: `${(minRatio / 10) * 100}%` }}
          />
          <div
            className="bg-emerald-800 transition-all duration-300 ease-in-out"
            style={{ width: `${((maxRatio - minRatio) / 10) * 100}%` }}
          />
          <div
            className="bg-amber-500 rounded-r-lg transition-all duration-300 ease-in-out"
            style={{ width: `${100 - (maxRatio / 10) * 100}%` }}
          />
        </div>
        {reserves.map(({ label, value, position, style, tooltipModalClass }, index) => (
          <div
            key={index}
            className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 group"
            style={{ left: `${(value / 10) * 100}%` }}
          >
            <Tooltip
              text={`${formatNumber(Math.round(value * 100), { minimumFractionDigits: 0 })}%`}
              style={{ display: 'contents' }}
              tooltipModalClass={tooltipModalClass || ''}
            >
              <div className="relative flex flex-col items-center justify-center">
                <div className={style} />
                <div
                  className={`absolute text-xs font-semibold text-black dark:text-white ${position} group-hover:scale-110 transition-transform`}
                >
                  {label}
                </div>
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )
}
