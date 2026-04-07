import { type OrdersBody, type OrdersQueryParams } from "@open-djed/api"

export const ordersKeys = {
  all: ["order"] as const,

  orders: (body: OrdersBody, params?: OrdersQueryParams) =>
    [...ordersKeys.all, "list", params, body] as const,
}
