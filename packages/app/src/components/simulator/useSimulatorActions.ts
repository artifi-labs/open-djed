import { useState, useCallback, useMemo } from "react"
import type { ScenarioInputs } from "@/components/simulator/calculations"

export function useSimulatorActions() {
  const [inputs, setInputs] = useState<ScenarioInputs>({
    shenAmount: 1000,
    buyDate: "2025-01-07",
    sellDate: "2026-05-08",
    buyAdaPrice: 0.4,
    sellAdaPrice: 0.8,
  })

  const onUpdate = useCallback(
    (field: keyof ScenarioInputs, value: string | number) => {
      setInputs((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    [],
  )

  const values = useMemo(() => inputs, [inputs])

  return {
    inputs: values,
    onUpdate,
  }
}
