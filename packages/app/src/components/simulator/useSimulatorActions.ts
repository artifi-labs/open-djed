import { useState, useCallback, useMemo } from "react"
import type { ScenarioInputs } from "@/components/simulator/calculations"

export function useSimulatorActions() {
  const [inputs, setInputs] = useState<ScenarioInputs>({
    shenAmount: 0,
    buyDate: "",
    sellDate: "",
    buyAdaPrice: 0,
    sellAdaPrice: 0,
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
