"use client"
import * as React from "react"
import BaseCard from "@/components/card/BaseCard"
import Action from "./Action"
import { ScenarioInputs } from "./calculations"

interface ActionsProps {
  values: ScenarioInputs
  onUpdate: (field: keyof ScenarioInputs, value: string | number) => void
}

const Actions: React.FC<ActionsProps> = ({ values, onUpdate }) => (
  <BaseCard className="desktop:p-24 desktop:w-160 p-16">
    <div className="desktop:gap-24 flex flex-col gap-16">
      <div className="flex flex-col font-medium">Scenario</div>
      <Action values={values} onUpdate={onUpdate} />
    </div>
  </BaseCard>
)
export default Actions
