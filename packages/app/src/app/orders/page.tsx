import Order from "@/components/order/Order"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: `Orders`,
    template: `%s | Orders`,
  },
}

export default function OrderPage() {
  return <Order />
}
