import Order from "@/components/order/Order"

import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: buildTitle("Orders"),
}

export default function OrderPage() {
  return <Order />
}
