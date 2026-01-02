"use client"

import * as React from "react"
import InputAction from "./InputAction"
import type { ScenarioInputs } from "./calculations"

export interface ActionProps {
  values: ScenarioInputs
  onUpdate: (field: keyof ScenarioInputs, value: string | number) => void
}

const Action: React.FC<ActionProps> = ({ values, onUpdate }) => {
  return (
    <div className="desktop:gap-24 flex flex-col gap-18">
      <InputAction values={values} onUpdate={onUpdate} />
    </div>
  )
}

export default Action
