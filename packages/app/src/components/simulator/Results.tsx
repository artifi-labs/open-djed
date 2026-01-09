"use client"

import * as React from "react"
import clsx from "clsx"
import BaseCard from "../card/BaseCard"
import { useResults, type ResultItem } from "@/components/simulator/useResults"
import type { ScenarioInputs } from "@/components/simulator/calculations"
import Tooltip from "../tooltip/Tooltip"
import Icon from "../Icon"
import { isEmptyValue } from "@/lib/utils"
import { ShenYieldChart } from "./charts/ShenYieldChart"

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
    <div className="desktop:flex-col desktop:items-start desktop:justify-start desktop:gap-4 flex flex-row items-center justify-between gap-4">
      {/* Label + Tooltip */}
      <div className="flex items-center gap-6">
        <p
          className={clsx(
            "text-secondary",
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

      {/* Values */}
      <div className={clsx("flex items-baseline", isTotal ? "gap-8" : "gap-4")}>
        {/* Primary value */}
        <p
          className={clsx(
            isTotal ? "text-xl font-bold" : "text-sm font-medium",
            className,
          )}
        >
          {item.primaryAmount}
        </p>

        {/* Secondary value */}
        <div
          className={clsx(
            "flex items-center gap-2",
            isTotal ? "text-sm" : "text-xxs",
            item.pnlColorClass,
          )}
        >
          {isTotal && item.pnlIconName && (
            <Icon name={item.pnlIconName} size={18} />
          )}

          <span className={!isTotal ? "text-secondary" : undefined}>
            {item.secondaryAmount}
          </span>
        </div>
      </div>
    </div>
  )
}

const Results: React.FC<ResultsProps> = ({ inputs }) => {
  const { totals, details } = useResults(inputs)
  const isContentBlurred =
    isEmptyValue(inputs.shenAmount) ||
    isEmptyValue(inputs.buyAdaPrice) ||
    isEmptyValue(inputs.sellAdaPrice)
  // isEmptyValue(inputs.buyDate) ||
  // isEmptyValue(inputs.sellDate)

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

  return (
    <BaseCard
      className="desktop:p-24 desktop:w-160 p-16"
      overlay={isContentBlurred}
      overlayContent={BlurContent || undefined}
    >
      <div className="flex flex-col gap-24">
        {/* Total PNL and ADA PNL */}
        <div className="desktop:grid-cols-2 desktop:gap-24 grid grid-rows-1 gap-16">
          {totals.map((item) => (
            <ResultSummaryItem key={item.label} {...item} />
          ))}
        </div>

        {/* Fees and Rewards */}
        <div className="desktop:grid-cols-2 desktop:gap-18 grid flex-1 grid-rows-1 gap-16">
          {details.map((item) => (
            <ResultSummaryItem key={item.label} {...item} />
          ))}
        </div>

        {/* Chart - To be Update */}
        <ShenYieldChart
          buyDate="2024-01-01"
          sellDate="2024-06-01"
          initialHoldings={10000}
          finalHoldings={11500}
          buyPrice={0.45}
          sellPrice={0.75}
          buyFees={200}
          sellFees={150}
          stakingRewards={Array.from({ length: 150 }, (_, i) => ({
            date: new Date(
              new Date("2024-01-01").getTime() + i * 24 * 60 * 60 * 1000,
            ).toISOString(),
            reward: Math.random() * 5 + 1, // Between 1 a 6 ADA per day
            daysSinceLastCredit: 1,
            balanceAfter: 10000 + i * 3,
            credited: true,
          }))}
        />
      </div>
    </BaseCard>
  )
}

export default Results
