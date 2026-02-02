import Simulator from "@/components/simulator/Simulator"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: buildTitle("Simulator"),
}

export default function SimulatorPage() {
  return <Simulator />
}
