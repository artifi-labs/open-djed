import { serve } from "@hono/node-server"
import {
  Lucid,
  Data,
  coreToUtxo,
  slotToUnixTime,
  CML,
  type LucidEvolution,
  type TxBuilder,
  paymentCredentialOf,
  stakeCredentialOf,
} from "@lucid-evolution/lucid"
import {
  cancelOrderByOwner,
  createBurnDjedOrder,
  createBurnShenOrder,
  createMintDjedOrder,
  createMintShenOrder,
  type OracleUTxO,
  type OrderUTxO,
  type PoolUTxO,
} from "@open-djed/txs"
import { registryByNetwork } from "@open-djed/registry"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "./env"
import { z } from "zod"
import "zod-openapi/extend"
import { describeRoute } from "hono-openapi"
import { validator as zValidator } from "hono-openapi/zod"
import { Blockfrost } from "@open-djed/blockfrost"
import { OracleDatum, OrderDatum, PoolDatum } from "@open-djed/data"
import TTLCache from "@isaacs/ttlcache"
import { createMiddleware } from "hono/factory"
import {
  AppError,
  BadRequestError,
  BalanceTooLowError,
  InternalServerError,
  ScriptExecutionError,
  UTxOContentionError,
  ValidationError,
} from "./errors"
import JSONbig from "json-bigint"
import {
  getOrdersByAddressKeys,
  getPeriodDjedMC,
  getPeriodReserveRatio,
} from "@open-djed/db"
import type { Order } from "@open-djed/db"
import type { Period } from "@open-djed/db/src/sync/utils"
export type { Order } from "@open-djed/db"

//NOTE: We only need this cache for transactions, not for other requests. Using this for `protocol-data` sligltly increases the response time.
const requestCache = new TTLCache<string, { value: Response; expiry: number }>({
  ttl: 10_000,
})
const cacheMiddleware = createMiddleware(async (c, next) => {
  const cacheKey = `${c.req.url}:${JSON.stringify(await c.req.json().catch(() => null))}`
  const cachedResponse = requestCache.get(cacheKey)

  if (cachedResponse && cachedResponse.expiry > Date.now()) {
    const { value } = cachedResponse
    const clonedBody = await value.clone().text()
    c.res = new Response(clonedBody, {
      headers: value.headers,
      status: value.status,
      statusText: value.statusText,
    })
    return
  }

  await next()

  const clonedResponse = c.res.clone()
  const clonedBody = await clonedResponse.text()
  requestCache.set(cacheKey, {
    value: new Response(clonedBody, {
      headers: clonedResponse.headers,
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
    }),
    expiry: Date.now() + 10_000,
  })
})

const txRequestBodySchema = z.object({
  hexAddress: z.string(),
  utxosCborHex: z.array(z.string()),
})

const network = env.NETWORK

const blockfrost = new Blockfrost(env.BLOCKFROST_URL, env.BLOCKFROST_PROJECT_ID)

const registry = registryByNetwork[network]

const chainDataCache = new TTLCache({ ttl: 10_000, checkAgeOnGet: true })

export const getPoolUTxO = async () => {
  const cached = chainDataCache.get<PoolUTxO>("poolUTxO")
  if (cached) return cached
  const rawPoolUTxO = (
    await blockfrost.getUtxosWithUnit(
      registry.poolAddress,
      registry.poolAssetId,
    )
  )[0]
  if (!rawPoolUTxO) throw new Error(`Couldn't get pool utxo.`)
  const rawDatum =
    rawPoolUTxO.datum ??
    (rawPoolUTxO.datumHash
      ? await blockfrost.getDatum(rawPoolUTxO.datumHash)
      : undefined)
  if (!rawDatum) throw new Error(`Couldn't get pool datum.`)
  const poolUTxO = {
    ...rawPoolUTxO,
    poolDatum: Data.from(rawDatum, PoolDatum),
  }
  chainDataCache.set("poolUTxO", poolUTxO)
  return poolUTxO
}

export const getOracleUTxO = async () => {
  const cached = chainDataCache.get<OracleUTxO>("oracleUTxO")
  if (cached) return cached
  const rawOracleUTxO = (
    await blockfrost.getUtxosWithUnit(
      registry.oracleAddress,
      registry.oracleAssetId,
    )
  )[0]
  if (!rawOracleUTxO) throw new Error(`Couldn't get oracle utxo.`)
  const rawDatum =
    rawOracleUTxO.datum ??
    (rawOracleUTxO.datumHash
      ? await blockfrost.getDatum(rawOracleUTxO.datumHash)
      : undefined)
  if (!rawDatum) throw new Error(`Couldn't get oracle datum.`)
  const oracleUTxO = {
    ...rawOracleUTxO,
    oracleDatum: Data.from(rawDatum, OracleDatum),
  }
  chainDataCache.set("oracleUTxO", oracleUTxO)
  return oracleUTxO
}

const getOrderUTxOs = async () => {
  const cached = chainDataCache.get<OrderUTxO[]>("orderUTxOs")
  if (cached) return cached
  const rawOrderUTxOs = await blockfrost.getUtxosWithUnit(
    registry.orderAddress,
    registry.orderAssetId,
  )
  const orderUTxOs = await Promise.all(
    rawOrderUTxOs.map(async (rawOrderUTxO) => {
      const rawDatum =
        rawOrderUTxO.datum ??
        (rawOrderUTxO.datumHash
          ? await blockfrost.getDatum(rawOrderUTxO.datumHash)
          : undefined)
      if (!rawDatum) throw new Error(`Couldn't get order datum.`)
      return {
        ...rawOrderUTxO,
        orderDatum: Data.from(rawDatum, OrderDatum),
      }
    }),
  )
  chainDataCache.set("orderUTxOs", orderUTxOs)
  return orderUTxOs
}

type ActionFields =
  | { MintDJED: { djedAmount: bigint; adaAmount: bigint } }
  | { BurnDJED: { djedAmount: bigint } }
  | { MintSHEN: { adaAmount: bigint; shenAmount: bigint } }
  | { BurnSHEN: { shenAmount: bigint } }

const parseActionFields = (actionFields: ActionFields) => {
  if ("MintDJED" in actionFields) {
    return {
      action: "Mint" as const,
      token: "DJED" as const,
      paid: actionFields.MintDJED.adaAmount,
      received: actionFields.MintDJED.djedAmount,
    }
  }

  if ("BurnDJED" in actionFields) {
    return {
      action: "Burn" as const,
      token: "DJED" as const,
      paid: actionFields.BurnDJED.djedAmount,
      received: null,
    }
  }

  if ("MintSHEN" in actionFields) {
    return {
      action: "Mint" as const,
      token: "SHEN" as const,
      paid: actionFields.MintSHEN.adaAmount,
      received: actionFields.MintSHEN.shenAmount,
    }
  }

  if ("BurnSHEN" in actionFields) {
    return {
      action: "Burn" as const,
      token: "SHEN" as const,
      paid: actionFields.BurnSHEN.shenAmount,
      received: null,
    }
  }

  throw new Error("Unknown actionFields variant")
}

const parseOrderUTxOsToOrder = (orderUTxO: OrderUTxO): Order => {
  const { txHash, outputIndex, orderDatum } = orderUTxO

  const { action, token, paid, received } = parseActionFields(
    orderDatum.actionFields,
  )

  return {
    status: "Created",
    fees: null,
    action,
    address: orderDatum.address,
    paid: paid,
    received: received,
    token,
    id: Number(orderDatum.creationDate),
    tx_hash: txHash,
    out_index: outputIndex,
    block: "",
    slot: 0n,
    orderDate: new Date(Number(orderDatum.creationDate)),
  }
}

export const getChainTime = async () => {
  const cached = chainDataCache.get<number>("now")
  if (cached) return cached
  const now = slotToUnixTime(network, await blockfrost.getLatestBlockSlot())
  chainDataCache.set("now", now)
  return now
}

export const getLucid = async () => {
  const cached = chainDataCache.get<LucidEvolution>("")
  if (cached) return cached
  const lucid = await Lucid(blockfrost, network)
  chainDataCache.set("lucid", lucid, { ttl: 600_000 })
  return lucid
}

async function completeTransaction(createOrderFn: () => TxBuilder) {
  try {
    const tx = await createOrderFn().complete({ localUPLCEval: false })
    return tx
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("EvaluateTransaction")) {
        if (
          err.message.includes(
            "Unknown transaction input (missing from UTxO set)",
          )
        ) {
          throw new UTxOContentionError()
        }
        throw new ScriptExecutionError()
      }
      if (
        err.message.includes(
          "Your wallet does not have enough funds to cover the required assets",
        )
      ) {
        throw new BalanceTooLowError()
      }
    }
    throw err
  }
}

const tokenSchema = z.enum(["DJED", "SHEN"]).openapi({ example: "DJED" })
export type TokenType = z.infer<typeof tokenSchema>

const actionSchema = z.enum(["Mint", "Burn"]).openapi({ example: "Mint" })
export type ActionType = z.infer<typeof actionSchema>

const app = new Hono()
  .basePath("/api")
  .use(cors())
  .use(logger())
  .get(
    "/protocol-data",
    describeRoute({ description: "Get on-chain protocol data" }),
    async (c) => {
      const [oracleFields, poolDatum] = await Promise.all([
        getOracleUTxO().then((o) => o.oracleDatum.oracleFields),
        getPoolUTxO().then((p) => p.poolDatum),
      ])
      return c.json({
        oracleDatum: {
          oracleFields: {
            adaUSDExchangeRate: {
              numerator: oracleFields.adaUSDExchangeRate.numerator.toString(),
              denominator:
                oracleFields.adaUSDExchangeRate.denominator.toString(),
            },
          },
        },
        poolDatum: {
          djedInCirculation: poolDatum.djedInCirculation.toString(),
          shenInCirculation: poolDatum.shenInCirculation.toString(),
          adaInReserve: poolDatum.adaInReserve.toString(),
          minADA: poolDatum.minADA.toString(),
        },
      })
    },
  )
  .post(
    "/:token/:action/:amount/tx",
    cacheMiddleware,
    describeRoute({
      description: "Create a transaction to perform an action on a token.",
      tags: ["Action"],
      responses: {
        200: {
          description: "Transaction CBOR ready to be signed",
          content: {
            "text/plain": {
              example: "CBOR",
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
    zValidator(
      "param",
      z.object({
        token: tokenSchema,
        action: actionSchema,
        amount: z.string(),
      }),
    ),
    zValidator("json", txRequestBodySchema),
    async (c) => {
      try {
        const [lucid, oracleUTxO, poolUTxO, now] = await Promise.all([
          getLucid(),
          getOracleUTxO(),
          getPoolUTxO(),
          getChainTime(),
        ])
        const param = c.req.valid("param")
        console.log("Param: ", param)
        const amount = BigInt(Math.round(Number(param.amount) * 1e6))
        if (amount < 0n) {
          throw new BadRequestError("Quantity must be positive number.")
        }
        const json = c.req.valid("json")
        console.log("Json: ", json)
        let address

        try {
          address = CML.Address.from_hex(json.hexAddress).to_bech32()
        } catch {
          throw new ValidationError("Invalid Cardano address format.")
        }
        lucid.selectWallet.fromAddress(
          address,
          json.utxosCborHex.map((cborHex) =>
            coreToUtxo(CML.TransactionUnspentOutput.from_cbor_hex(cborHex)),
          ),
        )
        const config = {
          lucid,
          registry,
          amount,
          address,
          oracleUTxO,
          poolUTxO,
          orderMintingPolicyRefUTxO: registry.orderMintingPolicyRefUTxO,
          now,
        }
        const tx = await completeTransaction(
          param.token === "DJED"
            ? param.action === "Mint"
              ? () => createMintDjedOrder(config)
              : () => createBurnDjedOrder(config)
            : param.action === "Mint"
              ? () => createMintShenOrder(config)
              : () => createBurnShenOrder(config),
        )
        const txCbor = tx.toCBOR()
        console.log("Tx CBOR: ", txCbor)
        const txHash = tx.toHash()
        console.log("Tx hash: ", txHash)
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
    "/cancel-order",
    describeRoute({
      description: "Build a cancel-order transaction and return it as CBOR",
      tags: ["Action"],
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
    zValidator(
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
      description: "Get the users' historical orders",
      tags: ["Action"],
      responses: {
        200: {
          description: "Successfully got the historical orders",
          content: {
            "text/plain": {
              example: "Order",
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
    zValidator("json", z.object({ usedAddresses: z.array(z.string()) })),
    zValidator(
      "query",
      z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("10"),
        status: z.string().optional(),
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
        const page = parseInt(c.req.query("page") || "1", 10)
        const limit = parseInt(c.req.query("limit") || "10", 10)
        const statusFilter = c.req.query("status")

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

        const ordersToSend = [...paginatedOrders]

        return new Response(
          JSONbig.stringify({
            orders: ordersToSend,
            pagination: {
              currentPage: page,
              totalPages: totalPages,
              totalOrders: totalOrders,
              ordersPerPage: limit,
              hasNextPage: page < totalPages,
              hasPreviousPage: page > 1,
            },
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        )
      } catch (err) {
        if (err instanceof AppError) {
          throw err
        }
        console.error("Unhandled error in orders endpoint:", err)
        throw new InternalServerError()
      }
    },
  )
  .get(
    "/historical-reserve-ratio",
    cacheMiddleware,
    describeRoute({
      description: "Get the historical reserve ratio",
      tags: ["Action"],
      responses: {
        200: {
          description: "Successfully got the historical reserve ratio",
          content: {
            "text/plain": {
              example: "reserve ratio",
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
    zValidator(
      "query",
      z.object({
        period: z.enum(["D", "W", "M", "Y", "All", "d", "w", "m", "y", "all"]),
      }),
    ),
    async (c) => {
      let param
      try {
        param = c.req.valid("query")
        if (!param?.period) {
          throw new ValidationError("Missing period in request.")
        }
      } catch (e) {
        console.error("Invalid or missing request payload.", e)
        throw new ValidationError("Invalid or missing request payload.")
      }
      try {
        const reserveRatios = await getPeriodReserveRatio(
          param.period.toUpperCase() as Period,
        )
        return c.json(reserveRatios)
      } catch (err) {
        if (err instanceof AppError) {
          throw err
        }
        console.error("Unhandled error in orders endpoint:", err)
        throw new InternalServerError()
      }
    },
  )
  .get(
    "/historical-djed-market-cap",
    cacheMiddleware,
    describeRoute({
      description: "Get the historical djed market cap",
      tags: ["Action"],
      responses: {
        200: {
          description: "Successfully got the historical djed market cap",
          content: {
            "text/plain": {
              example: "djed market cap",
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
    zValidator(
      "query",
      z.object({
        period: z.enum(["D", "W", "M", "Y", "All", "d", "w", "m", "y", "all"]),
      }),
    ),
    async (c) => {
      let param
      try {
        param = c.req.valid("query")
        if (!param?.period) {
          throw new ValidationError("Missing period in request.")
        }
      } catch (e) {
        console.error("Invalid or missing request payload.", e)
        throw new ValidationError("Invalid or missing request payload.")
      }
      try {
        const djedMarketCaps = await getPeriodDjedMC(
          param.period.toUpperCase() as Period,
        )
        return c.json(djedMarketCaps)
      } catch (err) {
        if (err instanceof AppError) {
          throw err
        }
        console.error("Unhandled error in orders endpoint:", err)
        throw new InternalServerError()
      }
    },
  )

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)

export type AppType = typeof app
