"use client"

import * as React from "react"
import InputField from "../input-fields/InputField"
import Dropdown from "../Dropdown"

export type InputActionProps = {
  amount?: string
  buyDate?: string
  sellDate?: string
  buyPrice?: string
  sellPrice?: string
}

const LabelWithIcon = ({ label }: { label: string }) => (
  <div className="flex">
    <p className="text-xxs font-medium">{label}</p>
  </div>
)

const InputAction: React.FC<InputActionProps> = ({
  amount,
  buyDate,
  sellDate,
  buyPrice,
  sellPrice,
}) => {
  return (
    <div className="flex flex-col gap-32">
      {/* SHEN Amount */}
      <div className="flex flex-col gap-12">
        <LabelWithIcon label="SHEN Amount" />
        <InputField
          id="input-field"
          placeholder="0"
          value={amount}
          size="Medium"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-22">
        <div className="flex flex-col gap-12">
          <LabelWithIcon label="Buy Date" />
          <Dropdown
            text={buyDate || "Date"}
            leadingIcon="Calendar"
            trailingIcon="Chevron-down"
            hasTag={false}
            menuItems={[]}
            size="medium"
          />
        </div>
        <div className="flex flex-col gap-12">
          <LabelWithIcon label="Sell Date" />
          <Dropdown
            text={sellDate || "Date"}
            leadingIcon="Calendar"
            trailingIcon="Chevron-down"
            menuItems={[]}
            hasTag={false}
            size="medium"
          />
        </div>
      </div>

      {/* ADA Prices */}
      <div className="grid grid-cols-2 gap-22">
        <div className="flex flex-col gap-12">
          <LabelWithIcon label="Buy ADA Price" />
          <InputField
            id="input-field"
            placeholder="0"
            value={buyPrice}
            size="Medium"
          />
        </div>
        <div className="flex flex-col gap-12">
          <LabelWithIcon label="Sell ADA Price" />
          <InputField
            id="input-field"
            placeholder="0"
            value={sellPrice}
            size="Medium"
          />
        </div>
      </div>
    </div>
  )
}

export default InputAction
