"use client"

import * as React from "react"
import clsx from "clsx"
import BaseCard from "../card/BaseCard"
import { useResults, type ResultItem } from "@/components/simulator/useResults"
import { type ScenarioInputs, useSimulatorResults } from "./calculations"
import Tooltip from "../tooltip/Tooltip"
import Icon from "../icons/Icon"
import { isEmptyValue, useTimeInterval } from "@/lib/utils"
import { FinanceLineChart } from "../charts/FinanceLineChart"
import { useToast } from "@/context/ToastContext"
import Divider from "../Divider"
import { useLocalStorage } from "usehooks-ts"
import { aggregateByBucket } from "@/utils/timeseries"
import type { AggregationConfig, DataRow } from "@/utils/timeseries"

export type ResultsProps = {
  inputs: ScenarioInputs
}

const ResultSummaryItem: React.FC<ResultItem> = ({
  label,
  values,
  tooltip,
  className,
}) => {
  const item = values[0]
  const isTotal = item.isTotal

  return (
    <div className="desktop:flex-col desktop:items-start desktop:justify-start desktop:gap-4 flex min-w-auto flex-row items-center justify-between gap-4">
      <div className="flex min-w-auto items-center gap-6">
        <p
          className={clsx(
            "text-secondary min-w-auto",
            isTotal ? "text-sm font-medium" : "font-regular text-xs",
          )}
        >
          {label}
        </p>
        {tooltip && (
          <Tooltip text={tooltip} tooltipDirection={isTotal ? "bottom" : "top"}>
            <Icon name="Information" size={14} className="cursor-pointer" />
          </Tooltip>
        )}
      </div>

      <div
        className={clsx(
          "flex min-w-auto flex-wrap items-baseline",
          isTotal ? "gap-8" : "gap-4",
        )}
      >
        <p
          className={clsx(
            isTotal ? "text-xl font-bold" : "text-sm font-medium",
            "min-w-auto break-all",
            className,
          )}
        >
          {item.primaryAmount}
        </p>

        <div
          className={clsx(
            "flex min-w-auto items-center gap-2",
            isTotal ? "text-sm" : "text-xxs",
            item.pnlColorClass,
          )}
        >
          {isTotal && item.pnlIconName && (
            <Icon
              name={item.pnlIconName}
              size={18}
              iconColor={item.pnlColorClass}
            />
          )}

          <span
            className={clsx(
              "min-w-auto break-all",
              !isTotal ? "text-secondary" : undefined,
            )}
          >
            {item.secondaryAmount}
          </span>
        </div>
      </div>
    </div>
  )
}

const Results: React.FC<ResultsProps> = ({ inputs }) => {
  const { totals, feeDetails, rewardDetails } = useResults(inputs)
  const { results: simulatorData, error } = useSimulatorResults(inputs)
  const { showToast } = useToast()
  const [detailedFees, setDetailedFees] = useLocalStorage<boolean>(
    "detailedFees",
    false,
  )
  const [detailedRewards, setDetailedRewards] = useLocalStorage<boolean>(
    "detailedRewards",
    false,
  )

  const isContentBlurred =
    isEmptyValue(inputs.usdAmount) ||
    isEmptyValue(inputs.buyAdaPrice) ||
    isEmptyValue(inputs.sellAdaPrice) ||
    isEmptyValue(inputs.buyDate) ||
    isEmptyValue(inputs.sellDate)

  const BlurContent = React.useMemo(
    () =>
      isContentBlurred ? (
        <div className="flex h-full flex-col justify-center gap-6 text-center">
          <p className="text-md text-primary font-semibold">
            Simulator Results
          </p>
          <p className="text-secondary px-4 text-sm">
            Start by entering an amount to see the results.
          </p>
        </div>
      ) : null,
    [isContentBlurred],
  )

  React.useEffect(() => {
    if (!error) return
    showToast({ message: error, type: "error" })
  }, [error, showToast])

  const aggregations: AggregationConfig = {
    adaPnlUsd: ["avg"],
    shenPnlUsd: ["avg"],
  }

  const { results, xAxisFormatter } = React.useMemo(() => {
    const {
      buyDate,
      sellDate,
      buyAdaPrice: buyPrice,
      sellAdaPrice: sellPrice,
      usdAmount,
    } = inputs

    const {
      initialAdaHoldings: initialHoldings = 0,
      finalAdaHoldings: finalHoldings = 0,
      stakingCredits: stakingRewards = [],
      feesEarned = 0,
    } = simulatorData || {}

    if (!buyDate || !sellDate || initialHoldings <= 0)
      return {
        results: [],
        xAxisFormater: (value: string | number) => String(value),
      }

    const dayInMs = 24 * 60 * 60 * 1000
    const startDate = new Date(buyDate)
    const endDate = new Date(sellDate)

    // calculate total days of holding
    const totalDays =
      Math.round((endDate.getTime() - startDate.getTime()) / dayInMs) + 1

    // price step over the total duration (totalDays - 1 intervals)
    const priceDifference = sellPrice - buyPrice
    const priceStep = totalDays > 1 ? priceDifference / (totalDays - 1) : 0

    // dynamic formatter for xAxis
    const formatter = (value: string | number, index?: number) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) return String(value)

      const month = date.toLocaleString(undefined, { month: "short" })
      const year = date.getFullYear()
      const displayedYear = date.toLocaleString(undefined, { year: "numeric" })
      // less than a year, show month + day
      if (totalDays <= 365) {
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      }
      // more than 10 years, show only year
      if (totalDays >= 365 * 10) {
        return date.toLocaleDateString(undefined, {
          year: "numeric",
        })
      }

      // always show Year on the first tick
      if (index === 0) {
        return `${month}, ${displayedYear}`
      }

      // check if this tick's year is different from the previous tick's year
      if (index !== undefined && results[index - 1]) {
        const prevDate = new Date(results[index - 1].date as string)
        const prevYear = prevDate.getFullYear()

        if (year !== prevYear) {
          return `${month}, ${displayedYear}`
        }
      }

      // default - show the year
      return displayedYear
    }

    // dynamically define x-axis interval for data aggregation
    const newInterval = useTimeInterval(startDate.getTime(), endDate.getTime())

    const data: DataRow[] = []

    // create a record with staking rewards date and value for easy lookup
    const rewardsMap = stakingRewards.reduce(
      (acc, entry) => {
        const date = new Date(entry.date).toISOString()
        acc[date] = (acc[date] || 0) + entry.reward
        return acc
      },
      {} as Record<string, number>,
    )

    // Calculate daily protocol fees earned
    const dailyFeesEarned = totalDays > 0 ? feesEarned / totalDays : 0

    const totalRewards = stakingRewards.reduce(
      (acc, entry) => acc + entry.reward,
      0,
    )
    const holdingsEndBase = initialHoldings + totalRewards + feesEarned
    const shenValueFactor =
      holdingsEndBase > 0 ? finalHoldings / holdingsEndBase : 1

    // Start with initial holdings (this is the ADA value of SHEN at purchase)
    let currentHoldings = initialHoldings
    const adaPurchased = buyPrice > 0 ? usdAmount / buyPrice : 0

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate.getTime() + i * dayInMs).toISOString()

      // Accumulate staking rewards for this day
      const rewardToday = rewardsMap[d] || 0
      currentHoldings += rewardToday

      // Accumulate protocol fees earned (distributed daily)
      currentHoldings += dailyFeesEarned

      // Calculate ADA price for this day (linear interpolation)
      const priceForDay: number = buyPrice + i * priceStep

      // Current holdings in ADA (without fees deducted)
      const ratio = totalDays > 1 ? i / (totalDays - 1) : 1
      const factorForDay = 1 + (shenValueFactor - 1) * ratio
      const holdingsForDay: number = currentHoldings * factorForDay

      data.push({
        date: d,
        adaPnlUsd: adaPurchased * priceForDay - usdAmount,
        shenPnlUsd: holdingsForDay * priceForDay - usdAmount,
      } as unknown as DataRow)
    }

    // Aggregate the daily data into buckets
    const results = aggregateByBucket(
      data,
      newInterval ?? 0,
      new Date(data[0].date),
      aggregations,
    )

    const buyTs = startDate.getTime()
    const sellTs = endDate.getTime()
    const priceRange = sellPrice - buyPrice
    const totalRange = sellTs - buyTs

    results.forEach((row) => {
      const rowTs = new Date(row.date).getTime()
      const ratio =
        Number.isFinite(totalRange) && totalRange > 0
          ? Math.min(1, Math.max(0, (rowTs - buyTs) / totalRange))
          : 0
      const priceAtRow = buyPrice + ratio * priceRange
      row.priceAtRow = priceAtRow
    })

    return { results, xAxisFormatter: formatter }
  }, [inputs, simulatorData])

  return (
    <BaseCard
      className="desktop:p-24 desktop:flex-none desktop:w-160 desktop:self-stretch min-h-144 w-full p-16"
      overlay={isContentBlurred}
      overlayContent={BlurContent || undefined}
    >
      <div className="flex flex-col gap-24">
        <div className="flex flex-col gap-10 rounded-lg">
          <div className="flex flex-col gap-6">
            <p className="min-w-auto text-sm font-medium">
              Your Returns Comparison (SHEN vs ADA)
            </p>
            <p className="text-secondary text-xs">
              This chart shows alternative outcomes. Holding SHEN or ADA.
            </p>
          </div>
          <div className="desktop:grid-cols-2 desktop:gap-24 grid grid-rows-1 gap-16">
            {totals.map((item) => (
              <ResultSummaryItem key={item.label} {...item} />
            ))}
          </div>
        </div>

        <Divider orientation="horizontal" />

        <div className="desktop:grid-cols-2 desktop:gap-24 grid grid-rows-1 gap-16">
          {/* Fees */}
          <div className="flex flex-col justify-start gap-8">
            <div className="flex flex-row items-center gap-8">
              <p className="min-w-auto text-sm font-medium">Fees</p>
              <Tooltip
                text={
                  detailedFees
                    ? "See simplified fees"
                    : "See detailed fees breakdown"
                }
                tooltipDirection="top"
              >
                <Icon
                  name={detailedFees ? "Minus" : "Plus"}
                  size={14}
                  onClick={() => setDetailedFees(!detailedFees)}
                />
              </Tooltip>
            </div>
            <div
              className={clsx(
                "desktop:gap-18 grid flex-1 grid-rows-1 gap-16",
                detailedFees ? "desktop:grid-rows-2" : "desktop:grid-rows-1",
              )}
            >
              {feeDetails.map((item) => {
                if (detailedFees && item.values[0].name === "totalFees")
                  return null
                if (!detailedFees && item.values[0].name !== "totalFees")
                  return null
                return <ResultSummaryItem key={item.label} {...item} />
              })}
            </div>
          </div>

          {/* Rewards */}
          <div className="flex flex-col justify-start gap-8">
            <div className="flex flex-row items-center gap-8">
              <p className="min-w-auto text-sm font-medium">Rewards</p>
              <Tooltip
                text={
                  detailedRewards
                    ? "See simplified rewards"
                    : "See detailed rewards breakdown"
                }
                tooltipDirection="top"
              >
                <Icon
                  name={detailedRewards ? "Minus" : "Plus"}
                  size={14}
                  onClick={() => setDetailedRewards(!detailedRewards)}
                />
              </Tooltip>
            </div>
            <div
              className={clsx(
                "desktop:gap-18 grid flex-1 grid-rows-1 gap-16",
                detailedFees ? "desktop:grid-rows-2" : "desktop:grid-rows-1",
              )}
            >
              {rewardDetails.map((item) => {
                if (detailedRewards && item.values[0].name === "totalRewards")
                  return null
                if (!detailedRewards && item.values[0].name !== "totalRewards")
                  return null
                return <ResultSummaryItem key={item.label} {...item} />
              })}
            </div>
          </div>
        </div>

        {/* Chart */}
        <FinanceLineChart
          title="Profit Over Time"
          data={results}
          xKey="date"
          lines={[
            {
              dataKey: "adaPnlUsd_avg",
              name: "ADA PNL",
              stroke: "var(--color-accent-3)",
            },
            {
              dataKey: "shenPnlUsd_avg",
              name: "SHEN PNL",
              stroke: "var(--color-accent-1",
            },
          ]}
          xTickFormatter={xAxisFormatter}
        />
      </div>
    </BaseCard>
  )
}

export default Results
