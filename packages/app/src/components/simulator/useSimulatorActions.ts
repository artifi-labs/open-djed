import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import type { ScenarioInputs } from "@/components/simulator/calculations"
import { useProtocolData } from "@/hooks/useProtocolData"

const NUMBER_FIELDS = new Set<keyof ScenarioInputs>([
  "shenAmount",
  "buyAdaPrice",
  "sellAdaPrice",
])

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
      const nextValue = NUMBER_FIELDS.has(field)
        ? (() => {
            if (typeof value === "number") return value
            const trimmed = value.trim()
            const parsed = trimmed === "" ? 0 : Number(trimmed)
            return Number.isFinite(parsed) ? parsed : 0
          })()
        : value

      setInputs((prev) => ({
        ...prev,
        [field]: nextValue,
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
