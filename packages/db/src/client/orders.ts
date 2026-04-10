import { prisma } from "../../lib/prisma"
import type { AddressKey } from "../sync/types"
import type { OrderStatus } from "../../generated/prisma/enums"

export const getOrdersByAddressKeys = async (
  keys: AddressKey[],
  statuses?: OrderStatus[],
) => {
  return await prisma.order.findMany({
    where: {
      AND: [
        ...(statuses?.length ? [{ status: { in: statuses } }] : []),
        {
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
      ],
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
