"use client"

import * as React from "react"
import InputField from "../input-fields/InputField"
import Dropdown from "../Dropdown"
import type { ScenarioInputs } from "./calculations"

export type InputActionProps = {
  values: ScenarioInputs
  onUpdate: (field: keyof ScenarioInputs, value: string | number) => void
}

const Label = ({ label }: { label: string }) => (
  <div className="flex">
    <p className="text-xxs font-medium">{label}</p>
  </div>
)

const InputAction: React.FC<InputActionProps> = ({ values, onUpdate }) => {
  const handleNumberChange = (field: keyof ScenarioInputs, val: string) => {
    if (val === "") {
      onUpdate(field, 0)
      return
    }

    const parsed = parseFloat(val)

    if (!isNaN(parsed)) {
      onUpdate(field, parsed)
    }
  }

  return (
    <div className="desktop:gap-32 flex flex-col gap-14">
      {/* SHEN Amount */}
      <div className="desktop:gap-12 flex flex-col gap-10">
        <Label label="SHEN Amount" />
        <InputField
          id="shen-amount"
          placeholder="0"
          value={values.shenAmount === 0 ? "" : values.shenAmount.toString()}
          onValueChange={(val) => handleNumberChange("shenAmount", val)}
          size="Medium"
        />
      </div>

      {/* Dates */}
      <div className="desktop:grid-cols-2 desktop:gap-22 grid gap-14">
        <div className="desktop:gap-12 flex flex-col gap-10">
          <Label label="Buy Date" />
          <Dropdown
            size="medium"
            leadingIcon="Calendar"
            text={values.buyDate || "Date"}
            hasTag={false}
            trailingIcon="Chevron-down"
            menuItems={[]}
          />
        </div>

        <div className="desktop:gap-12 flex flex-col gap-10">
          <Label label="Sell Date" />
          <Dropdown
            size="medium"
            leadingIcon="Calendar"
            text={values.sellDate || "Date"}
            hasTag={false}
            trailingIcon="Chevron-down"
            menuItems={[]}
          />
        </div>
      </div>

      {/* ADA Prices */}
      <div className="desktop:grid-cols-2 desktop:gap-22 grid gap-14">
        <div className="desktop:gap-12 flex flex-col gap-10">
          <Label label="Buy ADA Price" />
          <InputField
            id="buy-price"
            placeholder="0"
            value={
              values.buyAdaPrice === 0 ? "" : values.buyAdaPrice.toString()
            }
            onValueChange={(val) => handleNumberChange("buyAdaPrice", val)}
            size="Medium"
          />
        </div>

        <div className="desktop:gap-12 flex flex-col gap-10">
          <Label label="Sell ADA" />
          <InputField
            id="sell-price"
            placeholder="0"
            value={
              values.sellAdaPrice === 0 ? "" : values.sellAdaPrice.toString()
            }
            onValueChange={(val) => handleNumberChange("sellAdaPrice", val)}
            size="Medium"
          />
        </div>
      </div>
    </div>
  )
}

export default InputAction
