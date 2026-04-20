import Order from "@/components/order/Order"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return {
    title: buildTitle(t("orders.metadata.title")),
    description: t("orders.metadata.description"),
  }
}

export default function OrderPage() {
  return <Order />
}
