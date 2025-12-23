import { prisma } from "../../lib/prisma"
import type { AddressKey } from "../sync/types"

export const getOrdersByAddressKeys = async (keys: AddressKey[]) => {
  return await prisma.order.findMany({
    where: {
      OR: keys.map((key) => ({
        AND: [
          {
            address: {
              path: ["paymentKeyHash", "0"],
              equals: key.paymentKeyHash,
            },
          },
          {
            address: {
              path: ["stakeKeyHash", "0", "0", "0"],
              equals: key.stakeKeyHash,
            },
          },
        ],
      })),
    },
  })
}

export const getFirstOrder = async () => {
  return await prisma.order.findFirst()
}

export const getLastOrder = async () => {
  return await prisma.order.findFirst({
    orderBy: {
      id: "desc",
    },
  })
}
