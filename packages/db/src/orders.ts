import { prisma } from '../lib/prisma'

export const getOrdersByAddress = async ({ address }: { address: string }) => {
  const orders = await prisma.order.findMany({ where: { address: address } })
  return orders
}

const getAllorders = async () => {
  return await prisma.order.findFirst()
}
await getAllorders()
