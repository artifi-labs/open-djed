"use client"

import * as React from "react"
import clsx from "clsx"
import BaseCard from "../card/BaseCard"
import { useResults } from "@/components/simulator/useResults"

// export type ResultsProps = {}

export type ValueItem = {
  topValue: string
  bottomValue: string
}

export type ResultItem = {
  label: string
  values: ValueItem[]
  parentIndex: number
  className?: string
}

const ResultSummaryItem: React.FC<ResultItem> = ({
  label,
  values,
  parentIndex,
  className,
}) => {
  return (
    <div className={clsx("flex w-full flex-row", className)}>
      <p className="text-secondary flex-1 text-sm">{label}</p>

      <div className="flex flex-row gap-12">
        {values &&
          values.map((item, index) => (
            <React.Fragment key={parentIndex + "-" + index}>
              <div className="flex flex-col items-end">
                <p className="text-primary text-xs font-medium">
                  {item.topValue}
                </p>
                <p className="text-secondary text-xxs">{item.bottomValue}</p>
              </div>
            </React.Fragment>
          ))}
      </div>
    </div>
  )
}

const Results: React.FC = () => {
  const items = useResults() //TODO: data

  return (
    <BaseCard className="desktop:p-24 flex-1 p-16">
      <div className="desktop:gap-24 flex flex-col gap-16">
        <p className="text-md font-medium">Results</p>
        <div className="desktop:gap-16 flex flex-col gap-14 font-medium">
          {items.map((item, index) => (
            <ResultSummaryItem key={item.label} {...item} parentIndex={index} />
          ))}
        </div>
      </div>
    </BaseCard>
  )
}

export default Results
