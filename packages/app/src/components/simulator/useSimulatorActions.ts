import { useState, useCallback, useMemo } from "react"
import type { ScenarioInputs } from "@/components/simulator/calculations"


export function useSimulatorActions() {
  const [inputs, setInputs] = useState<ScenarioInputs>(() => {
    const now = new Date()
    const oneYearLater = new Date()
    oneYearLater.setFullYear(now.getFullYear() + 1)

    return {
      shenAmount: 0,
      buyDate: "Date",
      sellDate: "Date",
      buyAdaPrice: 0, 
      sellAdaPrice: 0,
    }
  })

  const handleUpdate = useCallback((field: keyof ScenarioInputs, value: string | number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const values = useMemo(() => inputs, [inputs])

  return {
    inputs: values,
    onUpdate: handleUpdate,
  }
}