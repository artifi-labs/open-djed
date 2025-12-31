"use client"

import * as React from "react"
import InputAction from "./InputAction"

export type ActionProps = {
  amount?: number
  buyDate?: string
  sellDate?: string
  buyPrice?: number
  sellPrice?: number
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
