import { Hono } from "hono"
import { describeRoute } from "hono-openapi"
import { resolver, validator } from "hono-openapi/zod"
import {
  ordersBodySchema,
  ordersResponseApiSchema,
  orderStatusSchema,
} from "./orders.schema"
import {
  AppError,
  BadRequestError,
  InternalServerError,
  ValidationError,
} from "../../shared"
import {
  CML,
  coreToUtxo,
  paymentCredentialOf,
  stakeCredentialOf,
} from "@lucid-evolution/lucid"
import { getOrdersByAddressKeys, type Order } from "@open-djed/db"
import { cancelOrderByOwner } from "@open-djed/txs"
import { env } from "../../lib/env"
import { serializeOrder } from "./orders.serializer"
import { getLucid, registry } from "../../core"
import z from "zod"
import { getOrderUTxOs, parseOrderUTxOsToOrder } from "./orders.helpers"
import { cacheMiddleware } from "../../shared"

export const ordersRouter = new Hono()
  .post(
    "/cancel-order",
    describeRoute({
      summary: "Cancel an existing order",
      description: "Build a cancel-order transaction and return it as CBOR",
      tags: ["Orders"],
      responses: {
        200: {
          description: "Successfully built the cancel order transaction",
          content: {
            "text/plain": {
              example: "84a40081825820...",
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "application/json": {
              example: { error: "BadRequestError", message: "Invalid input" },
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              example: {
                error: "InternalServerError",
                message: "Something went wrong.",
              },
            },
          },
        },
      },
    }),
    validator(
      "json",
      z.object({
        hexAddress: z.string(),
        utxosCborHex: z.array(z.string()),
        txHash: z.string(),
        outIndex: z.number(),
      }),
    ),
    async (c) => {
      try {
        const { hexAddress, utxosCborHex, txHash, outIndex } =
          c.req.valid("json")

        const lucid = await getLucid()
        const allOrders = await getOrderUTxOs()
        const targetOrder = allOrders.find(
          (o) => o.txHash === txHash && o.outputIndex === outIndex,
        )

        if (!targetOrder) {
          throw new BadRequestError("Order UTxO not found for given outRef.")
        }

        let addressBech32
        try {
          addressBech32 = CML.Address.from_hex(hexAddress).to_bech32()
        } catch {
          throw new ValidationError("Invalid Cardano address format.")
        }

        lucid.selectWallet.fromAddress(
          addressBech32,
          utxosCborHex.map((cborHex) =>
            coreToUtxo(CML.TransactionUnspentOutput.from_cbor_hex(cborHex)),
          ),
        )

        const tx = await cancelOrderByOwner({
          network: env.NETWORK,
          lucid,
          registry,
          orderUTxO: targetOrder,
          orderMintingPolicyRefUTxO: registry.orderMintingPolicyRefUTxO,
          orderSpendingValidatorRefUTxO: registry.orderSpendingValidatorRefUTxO,
        }).complete({ localUPLCEval: false })

        const txCbor = tx.toCBOR()
        console.log("Cancel-order Tx CBOR:", txCbor)
        return c.text(txCbor)
      } catch (err) {
        if (err instanceof AppError) {
          console.error(`${err.name}: ${err.message}`)
          return c.json({ error: err.name, message: err.message }, err.status)
        }
        console.error("Unhandled error:", err)
        return c.json(
          { error: "InternalServerError", message: "Something went wrong." },
          500,
        )
      }
    },
  )
  .post(
    "/historical-orders",
    cacheMiddleware,
    describeRoute({
      summary: "Get user historical orders",
      description: "Get the user historical orders",
      tags: ["Orders"],
      responses: {
        200: {
          description: "Successfully got the historical orders",
          content: {
            "application/json": {
              schema: resolver(ordersResponseApiSchema),
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "text/plain": {
              example: "Bad Request",
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "text/plain": {
              example: "Internal Server Error",
            },
          },
        },
      },
    }),
    validator("json", ordersBodySchema),
    validator(
      "query",
      z.object({
        page: z.coerce.number().optional().default(1),
        limit: z.coerce.number().optional().default(10),
        status: orderStatusSchema.optional(),
      }),
    ),
    async (c) => {
      let json
      try {
        json = c.req.valid("json")
        if (!json?.usedAddresses) {
          throw new ValidationError("Missing hexAddress in request.")
        }
      } catch (e) {
        console.error("Invalid or missing request payload.", e)
        throw new ValidationError("Invalid or missing request payload.")
      }
      try {
        // Get filters and pagination parameters
        const { page, limit, status: statusFilter } = c.req.valid("query")

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
          throw new ValidationError(
            "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.",
          )
        }

        const pendingOrders = await getOrderUTxOs()

        const usedAddressesKeys = json.usedAddresses.map((addr) => {
          try {
            const paymentKeyHash = paymentCredentialOf(addr)
            const stakeKeyHash = stakeCredentialOf(addr)
            return {
              paymentKeyHash: paymentKeyHash.hash,
              stakeKeyHash: stakeKeyHash.hash,
            }
          } catch {
            return { paymentKeyHash: "", stakeKeyHash: "" }
          }
        })

        const filteredPendingOrders = pendingOrders.filter((order) =>
          usedAddressesKeys.some(
            (key) =>
              order.orderDatum.address.paymentKeyHash[0] ===
                key.paymentKeyHash &&
              order.orderDatum.address.stakeKeyHash[0][0][0] ===
                key.stakeKeyHash,
          ),
        )

        const parsedPendingOrders: Order[] = filteredPendingOrders.map(
          (order) => {
            return parseOrderUTxOsToOrder(order)
          },
        )

        const userHistoricalOrders: Order[] =
          await getOrdersByAddressKeys(usedAddressesKeys)

        const sortedOrders = [...parsedPendingOrders, ...userHistoricalOrders]
          .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
          .filter(
            (order, index, self) =>
              self.findIndex((o) => o.tx_hash === order.tx_hash) === index,
          )

        const orders = statusFilter
          ? sortedOrders.filter((order) => order.status === statusFilter)
          : sortedOrders

        // Calculate pagination
        const totalOrders = orders.length
        const totalPages = Math.ceil(totalOrders / limit)
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedOrders = orders.slice(startIndex, endIndex)

        const ordersToSend = paginatedOrders.map(serializeOrder)

        const response = {
          data: ordersToSend,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalOrders: totalOrders,
            ordersPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        }

        try {
          const parsedResponse = ordersResponseApiSchema.parse(response)
          return c.json(parsedResponse)
        } catch (e) {
          console.error("Response validation error:", e)
        }
      } catch (err) {
        if (err instanceof AppError) {
          throw err
        }
        console.error("Unhandled error in orders endpoint:", err)
        throw new InternalServerError()
      }
    },
  )
