"use client"

import * as React from "react"
import BaseCard from "@/components/card/BaseCard"
import InputField from "../input-fields/InputField"
import Dropdown from "../Dropdown"
import Calendar from "../calendar/Calendar"
import { type CalendarValue } from "../calendar/Calendar.types"
import { toISODate, formatDateLabel } from "@/lib/utils"
import type { ScenarioInputs } from "./calculations"
import Icon from "../icons/Icon"
import Tooltip from "../tooltip/Tooltip"

export type InputActionProps = {
  values: ScenarioInputs
  onUpdate: (field: keyof ScenarioInputs, value: string | number) => void
}

const SCENARIO_CONFIG: Record<
  keyof ScenarioInputs,
  { label: string; tooltip: string }
> = {
  shenAmount: {
    label: "SHEN Amount",
    tooltip: "The number of SHEN tokens you purchased",
  },
  buyDate: {
    label: "Buy Date",
    tooltip: "The date you bought SHEN",
  },
  sellDate: {
    label: "Sell Date",
    tooltip: "The date you plan to sell SHEN",
  },
  buyAdaPrice: {
    label: "Buy ADA Price",
    tooltip:
      "The ADA price when you buy SHEN, used to calculate your profit/loss",
  },
  sellAdaPrice: {
    label: "Sell ADA Price",
    tooltip:
      "The ADA price when you sell SHEN, used to calculate your profit/loss",
  },
}

const FieldLabel = ({
  label,
  tooltipText,
}: {
  label: string
  tooltipText: string
}) => (
  <div className="flex gap-6">
    <p className="text-xxs font-medium">{label}</p>
    <Tooltip text={tooltipText} tooltipDirection="top">
      <div className="flex cursor-pointer">
        <Icon name="Information" size={14} />
      </div>
    </Tooltip>
  </div>
)

const InputAction: React.FC<InputActionProps> = ({ values, onUpdate }) => {
  const handleValueChange = (field: keyof ScenarioInputs, val: string) => {
    onUpdate(field, val)
  }

  const sellDateDisabledDates = React.useMemo(() => {
    if (!values.buyDate) return undefined
    const buyDate = new Date(values.buyDate)
    if (Number.isNaN(buyDate.getTime())) return undefined
    const lastDisabled = new Date(buyDate)
    lastDisabled.setDate(lastDisabled.getDate() - 1)
    return [{ end: lastDisabled }]
  }, [values.buyDate])

  return (
    <BaseCard className="desktop:p-24 desktop:self-stretch p-16">
      <div className="desktop:gap-24 flex flex-col gap-16">
        <div className="flex flex-col font-medium">Scenario</div>
        {/* Content */}
        <div className="desktop:gap-24 flex flex-col gap-18">
          <div className="desktop:gap-32 flex flex-col gap-14">
            {/* SHEN Amount */}
            <div className="desktop:gap-12 flex flex-col gap-10">
              <FieldLabel
                label={SCENARIO_CONFIG.shenAmount.label}
                tooltipText={SCENARIO_CONFIG.shenAmount.tooltip}
              />
              <InputField
                id="shen-amount"
                placeholder="0"
                value={
                  values.shenAmount.toString() === "0"
                    ? ""
                    : values.shenAmount.toString()
                }
                onValueChange={(val) => handleValueChange("shenAmount", val)}
                size="Medium"
                autoComplete="off"
                maxValue={Number.MAX_SAFE_INTEGER}
              />
            </div>

            {/* Dates */}
            <div className="desktop:gap-32 grid gap-14">
              {(["buyDate", "sellDate"] as const).map((id) => (
                <div key={id} className="desktop:gap-12 flex flex-col gap-10">
                  <FieldLabel
                    label={SCENARIO_CONFIG[id].label}
                    tooltipText={SCENARIO_CONFIG[id].tooltip}
                  />
                  <Dropdown
                    size="medium"
                    leadingIcon="Calendar"
                    text={formatDateLabel(values[id])}
                    hasTag={false}
                    trailingIcon="Chevron-down"
                    menuItems={[]}
                    renderMenu={(close) => (
                      <Calendar
                        canMultipleSelect={false}
                        hasTimeSelection={false}
                        disabledDates={
                          id === "sellDate" ? sellDateDisabledDates : undefined
                        }
                        defaultSelectedDays={
                          values[id]
                            ? { start: new Date(values[id]) }
                            : undefined
                        }
                        onChange={(value: CalendarValue) => {
                          if (!value.range.start) return
                          const nextValue = toISODate(value.range.start)
                          if (nextValue === values[id]) return
                          if (id === "sellDate" && values.buyDate) {
                            const normalizedValue =
                              nextValue < values.buyDate
                                ? values.buyDate
                                : nextValue
                            onUpdate(id, normalizedValue)
                            close()
                            return
                          }
                          onUpdate(id, nextValue)
                          if (
                            id === "buyDate" &&
                            values.sellDate &&
                            values.sellDate < nextValue
                          ) {
                            onUpdate("sellDate", nextValue)
                          }
                          close()
                        }}
                      />
                    )}
                  />
                </div>
              ))}
            </div>

            {/* ADA Prices */}
            <div className="desktop:gap-32 grid gap-14">
              {(["buyAdaPrice", "sellAdaPrice"] as const).map((id) => (
                <div key={id} className="desktop:gap-12 flex flex-col gap-10">
                  <FieldLabel
                    label={SCENARIO_CONFIG[id].label}
                    tooltipText={SCENARIO_CONFIG[id].tooltip}
                  />
                  <InputField
                    id={id}
                    placeholder="0"
                    value={values[id] === 0 ? "" : values[id].toString()}
                    onValueChange={(val) => handleValueChange(id, val)}
                    size="Medium"
                    autoComplete="off"
                    maxValue={Number.MAX_SAFE_INTEGER}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  )
}

export default InputAction
