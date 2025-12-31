"use client"

import * as React from "react"
import BaseCard from "@/components/card/BaseCard"
import Action from "./Action"

// export type ActionsProps = {}

const Actions: React.FC = () => {
  return (
    <BaseCard className="desktop:p-24 w-160 p-16">
      <div className="desktop:gap-24 flex flex-col gap-16">
        <div className="flex flex-col font-medium">Scenario</div>
        <Action />
      </div>
    </BaseCard>
  )
}

export default Actions
