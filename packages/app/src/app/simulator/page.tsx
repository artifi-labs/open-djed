import Simulator from "@/components/simulator/Simulator"
import { getDictionary } from "@/i18n/server"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary()

  return {
    title: buildTitle(dict.simulator.pageTitle),
  }
}
export default function SimulatorPage() {
  return <Simulator />
}
