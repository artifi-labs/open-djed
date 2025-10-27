import { useProtocolData } from '~/hooks/useProtocolData'
import { formatNumber, formatValue, type Value } from '~/utils'
import { Skeleton } from './Skeleton'
import { SkeletonWrapper } from './SkeletonWrapper'
import { ReserveRatioGraph } from './ReserveRatioGraph'
import { maxReserveRatio, minReserveRatio } from '@open-djed/math'
import { useState } from 'react'

export function ReserveDetails() {
  const { isPending, error, data } = useProtocolData()
  const [showGraph, setShowGraph] = useState(true)
  if (error) return <div className="text-red-500 font-bold">ERROR: {error.message}</div>
  const toUSD = data ? (value: Value) => data.to(value, 'DJED') : undefined
  const currentRatio = data?.protocolData.reserve.ratio ?? 0

  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-2 md:p-4 w-full max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Reserve Details</h2>
        <div className="flex items-center space-x-2 bg-primary dark:bg-primary rounded-full p-1 relative">
          <div
            className={`absolute h-8 w-8 bg-white dark:bg-black rounded-full transition-all duration-300 ease-in-out ${
              showGraph ? 'translate-x-10' : 'translate-x-0'
            }`}
          />
          <button
            onClick={() => setShowGraph(false)}
            className={`p-2 rounded-full z-10 transition-all duration-300 cursor-pointer transform ${!showGraph ? 'text-gray-800 dark:text-white scale-105' : 'text-gray-600 dark:text-gray-400 hover:scale-105'}`}
          >
            <i className="fa-solid fa-table"></i>
          </button>
          <button
            onClick={() => setShowGraph(true)}
            className={`p-2 rounded-full z-10 transition-all duration-300 cursor-pointer transform ${showGraph ? 'text-gray-800 dark:text-white scale-105' : 'text-gray-600 dark:text-gray-400 hover:scale-105'}`}
          >
            <i className="fa-solid fa-chart-simple"></i>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium">Reserve Ratio</p>
        {isPending ? (
          <Skeleton width="w-full" height="h-3" />
        ) : showGraph ? (
          <ReserveRatioGraph
            currentRatio={currentRatio}
            minRatio={minReserveRatio.toNumber()}
            maxRatio={maxReserveRatio.toNumber()}
          />
        ) : (
          <div>
            <div className="flex flex-row justify-between">
              <p className="text-gray-600 dark:text-gray-400">Current Ratio:</p>
              <p className="text-lg">{formatNumber(currentRatio * 100, { maximumFractionDigits: 2 })} %</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-gray-600 dark:text-gray-400">Min Ratio:</p>
              <p className="text-lg">{minReserveRatio.toNumber() * 100} %</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-gray-600 dark:text-gray-400">Max Ratio:</p>
              <p className="text-lg">{maxReserveRatio.toNumber() * 100} %</p>
            </div>
          </div>
        )}

        <div className="flex flex-row justify-between">
          <p className="font-medium">Reserve Value</p>
          <SkeletonWrapper isPending={isPending}>
            <p className="text-lg">{data ? formatValue(data.protocolData.reserve.amount) : '-'}</p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? data
                  ? `$${formatNumber(toUSD(data.protocolData.reserve.amount), { maximumFractionDigits: 2 })}`
                  : '-'
                : '-'}
            </p>
          </SkeletonWrapper>
        </div>
      </div>
    </div>
  )
}
