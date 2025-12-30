"use client"

import * as React from "react"
import InputAction from "./InputAction"

export type ActionProps = {
  amount?: string
  buyDate?: string
  sellDate?: string
  buyPrice?: string
  sellPrice?: string
}

const Action: React.FC<ActionProps> = ({
  amount,
  buyDate,
  sellDate,
  buyPrice,
  sellPrice,
}) => {
  return (
    <div className="desktop:gap-24 flex flex-col gap-18">
      <InputAction
        amount={amount}
        buyDate={buyDate}
        sellDate={sellDate}
        buyPrice={buyPrice}
        sellPrice={sellPrice}
      />
    </div>
  )
}

export default Action
