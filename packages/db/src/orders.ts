import { prisma } from '../lib/prisma'
import type { AddressKey } from './types'

export const getOrdersByAddressKeys = async (keys: AddressKey[]) => {
  return await prisma.order.findMany({
    where: {
      OR: keys.map((key) => ({
        AND: [
          {
            address: {
              path: ['paymentKeyHash', '0'],
              equals: key.paymentKeyHash,
            },
          },
          {
            address: {
              path: ['stakeKeyHash', '0', '0', '0'],
              equals: key.stakeKeyHash,
            },
          },
        ],
      })),
    },
  })
}

export const getAllorders = async () => {
  return await prisma.order.findFirst()
}
