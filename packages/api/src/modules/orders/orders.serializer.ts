import type { Order } from "@open-djed/db"
import type { OrderApi } from "./orders.schema"

export const serializeOrder = (order: Order): OrderApi => ({
  ...order,
  id: order.id ?? 0,
  slot: order.slot.toString(),
  paid: order.paid?.toString() ?? null,
  fees: order.fees?.toString() ?? null,
  received: order.received?.toString() ?? null,
  orderDate: order.orderDate.toISOString(),
})
