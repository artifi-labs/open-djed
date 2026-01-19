import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import type { ScenarioInputs } from "@/components/simulator/calculations"
import { useProtocolData } from "@/hooks/useProtocolData"

export function useSimulatorActions() {
  const [inputs, setInputs] = useState<ScenarioInputs>({
    shenAmount: 0,
    buyDate: "",
    sellDate: "",
    buyAdaPrice: 0,
    sellAdaPrice: 0,
  })
  const { data: protocolData } = useProtocolData()
  const hasInitializedPrices = useRef(false)

  useEffect(() => {
    if (!protocolData || hasInitializedPrices.current) return
    const currentAdaPrice = protocolData.to({ ADA: 1 }, "DJED")

    setInputs((prev) => ({
      ...prev,
      buyAdaPrice: Number(currentAdaPrice.toFixed(4)),
      sellAdaPrice: Number((currentAdaPrice * 1.1).toFixed(4)),
    }))
    hasInitializedPrices.current = true
  }, [protocolData])

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
