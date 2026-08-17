import Simulator from "@/components/simulator/Simulator"
import { buildAlternates, buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: buildTitle(t("simulator.metadata.title")),
    description: t("simulator.metadata.description"),
    alternates: await buildAlternates("/simulator"),
  }
}
export default function SimulatorPage() {
  return <Simulator />
}
