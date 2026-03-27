import {
  type OrdersBody,
  type OrdersQueryParams,
} from "@/schemas/api/orders/orders.schema"

export const ordersKeys = {
  all: ["order"] as const,

  orders: (body: OrdersBody, params?: OrdersQueryParams) =>
    [...ordersKeys.all, "list", params, body] as const,
}
