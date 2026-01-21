"use client"

import * as React from "react"
import clsx from "clsx"
import BaseCard from "../card/BaseCard"
import { useResults, type ResultItem } from "@/components/simulator/useResults"
import { type ScenarioInputs, useSimulatorResults } from "./calculations"
import Tooltip from "../tooltip/Tooltip"
import Icon from "../icons/Icon"
import { isEmptyValue } from "@/lib/utils"
import { ShenYieldChart } from "./charts/ShenYieldChart"
import { useToast } from "@/context/ToastContext"

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
      {/* Label + Tooltip */}
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

      {/* Values */}
      <div
        className={clsx(
          "flex min-w-auto flex-wrap items-baseline",
          isTotal ? "gap-8" : "gap-4",
        )}
      >
        {/* Primary value */}
        <p
          className={clsx(
            isTotal ? "text-xl font-bold" : "text-sm font-medium",
            "min-w-auto break-all",
            className,
          )}
        >
          {item.primaryAmount}
        </p>

        {/* Secondary value */}
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
  const { totals, details } = useResults(inputs)
  const { results: simulatorData, error } = useSimulatorResults(inputs)
  const { showToast } = useToast()

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
    showToast({
      message: error,
      type: "error",
    })
  }, [error, showToast])

  return (
    <>
      <BaseCard
        className="desktop:p-24 desktop:flex-none desktop:w-160 desktop:self-stretch p-16"
        overlay={isContentBlurred}
        overlayContent={BlurContent || undefined}
      >
        {isContentBlurred ? null : (
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

            {/* Chart */}
            <ShenYieldChart
              buyDate={inputs.buyDate}
              sellDate={inputs.sellDate}
              initialHoldings={simulatorData?.initialAdaHoldings ?? 0}
              finalHoldings={simulatorData?.finalAdaHoldings ?? 0}
              buyPrice={inputs.buyAdaPrice}
              sellPrice={inputs.sellAdaPrice}
              buyFees={simulatorData?.buyFee ?? 0}
              sellFees={simulatorData?.sellFee ?? 0}
              feesEarned={simulatorData?.feesEarned ?? 0}
              stakingRewards={simulatorData?.stakingCredits ?? []}
            />
          </div>
        )}
      </BaseCard>
    </>
  )
}

export default Results
