import Order from "@/components/order/Order"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  
  return {
    title: buildTitle("orders.pageTitle"),
  }
}

export default function OrderPage() {
  return <Order />
}
