import Simulator from "@/components/simulator/Simulator"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: `Simulator`,
    template: `%s | Simulator`,
  },
}

export default function SimulatorPage() {
  return <Simulator />
}
