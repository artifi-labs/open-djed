"use client"

import * as React from "react"
import BaseCard from "../card/BaseCard"
import { useResults } from "@/components/simulator/useResults"

export type ResultsProps = {}

export type ValueItem = {
  topValue: string
  bottomValue: string
}

export type ResultItem = {
  parentIndex: number
  label: string
  values?: ValueItem[]
}

const ResultSummaryItem: React.FC<ResultItem> = ({
  parentIndex,
  label,
  values,
}) => {
  return (
    <div className="flex flex-row gap-12">
      <p className="text-secondary flex-1 text-sm">{label}</p>

      {/* Values */}
      <div className="flex flex-row gap-12">
        {values &&
          values.map((item, index) => (
            <React.Fragment key={parentIndex + "-" + index}>
              <div className="flex flex-col items-end gap-4">
                <p className="text-xs">{item.topValue}</p>
                <p className="text-secondary text-xxs">{item.bottomValue}</p>
              </div>
            </React.Fragment>
          ))}
      </div>
    </div>
  )
}

const Results: React.FC<ResultsProps> = () => {
  const items = useResults() //TODO: Data

  return (
    <BaseCard className="desktop:p-24 p-16">
      <div className="desktop:gap-24 flex flex-col gap-16">
        <p className="text-md font-medium">Results</p>
        <div className="desktop:gap-16 flex flex-col gap-14">
          {items.map((item, index) => (
            <ResultSummaryItem key={item.label} {...item} parentIndex={index} />
          ))}
        </div>
      </div>
    </BaseCard>
  )
}

export default Results
