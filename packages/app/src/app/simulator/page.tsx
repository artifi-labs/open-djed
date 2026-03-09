import Simulator from "@/components/simulator/Simulator"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export function generateMetadata(): Metadata {
  return {
    title: buildTitle("simulator.pageTitle"),
  }
}
export default function SimulatorPage() {
  return <Simulator />
}
