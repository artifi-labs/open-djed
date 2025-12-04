import type { Actions } from '../generated/prisma/enums'
import { prisma } from '../lib/prisma'

export const registerNewOrder = async ({ address, action }: { address: string; action: Actions }) => {
  const newOrder = await prisma.order.create({ data: { address, action } })
  return newOrder
}

export const getOrdersByAddress = async ({ address }: { address: string }) => {
  const orders = await prisma.order.findMany({ where: { address: address } })
  return orders
}
