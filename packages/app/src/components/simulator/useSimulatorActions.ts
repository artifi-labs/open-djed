import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import type { ScenarioInputs } from "@/components/simulator/calculations"
import { useProtocolData } from "@/hooks/useProtocolData"

const NUMBER_FIELDS = new Set<keyof ScenarioInputs>([
  "usdAmount",
  "buyAdaPrice",
  "sellAdaPrice",
])

export function useSimulatorActions() {
  const [inputs, setInputs] = useState<ScenarioInputs>({
    usdAmount: 0,
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
    const currentDate = new Date().toISOString().split("T")[0]
    const defaultSellDate = new Date(currentDate)
    defaultSellDate.setFullYear(defaultSellDate.getFullYear() + 1)
    const sellDateString = defaultSellDate.toISOString().split("T")[0]

    setInputs(() => ({
      usdAmount: 1000,
      buyDate: currentDate,
      sellDate: sellDateString,
      buyAdaPrice: Number(currentAdaPrice.toFixed(4)),
      sellAdaPrice: Number((currentAdaPrice * 1.1).toFixed(4)),
    }))
    hasInitializedPrices.current = true
  }, [protocolData])

  const onUpdate = useCallback(
    (field: keyof ScenarioInputs, value: string | number) => {
      let nextValue = value

      if (NUMBER_FIELDS.has(field)) {
        if (typeof value === "string") {
          if (value === "" || value === "." || value.endsWith(".")) {
            nextValue = value
          } else {
            const parsed = parseFloat(value)
            nextValue = isNaN(parsed) ? 0 : parsed
          }
        }
      }

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
