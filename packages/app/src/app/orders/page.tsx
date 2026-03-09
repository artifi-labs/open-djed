import Order from "@/components/order/Order"
import { getDictionary } from "@/i18n/server"

import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary()

  return {
    title: buildTitle(dict.orders.pageTitle),
  }
}

export default function OrderPage() {
  return <Order />
}
