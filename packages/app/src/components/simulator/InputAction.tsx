"use client"

import * as React from "react"
import InputField from "../input-fields/InputField"
import Dropdown from "../Dropdown"

export type InputActionProps = {
  amount?: number
  buyDate?: string
  sellDate?: string
  buyPrice?: number
  sellPrice?: number
}

const Label = ({ label }: { label: string }) => (
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
    <div className="desktop:gap-32 flex flex-col gap-14">
      {/* SHEN Amount */}
      <div className="desktop:gap-12 flex flex-col gap-10">
        <Label label="SHEN Amount" />
        <InputField
          id="shen-amount"
          placeholder="0"
          value={amount}
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
            text={buyDate || "Date"}
            hasTag={false}
            trailingIcon="Chevron-down"
            menuItems={[]} //TODO: Date component?
          />
        </div>

        <div className="desktop:gap-12 flex flex-col gap-10">
          <Label label="Sell Date" />
          <Dropdown
            size="medium"
            leadingIcon="Calendar"
            text={sellDate || "Date"}
            hasTag={false}
            trailingIcon="Chevron-down"
            menuItems={[]} //TODO: Date component?
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
            value={buyPrice}
            size="Medium"
          />
        </div>

        <div className="desktop:gap-12 flex flex-col gap-10">
          <Label label="Sell ADA" />
          <InputField
            id="sell-price"
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
