import Rewards from "@/components/rewards/Rewards"
import { REWARDS_ENABLED } from "@/lib/constants"
import { buildAlternates, buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: buildTitle(t("rewards.metadata.title")),
    description: t("rewards.metadata.description"),
    alternates: await buildAlternates("/rewards"),
  }
}

export default function RewardsPage() {
  if (!REWARDS_ENABLED) notFound()

  return <Rewards />
}
