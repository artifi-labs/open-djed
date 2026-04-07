import { Hono } from "hono"
import { cacheMiddleware } from "../../shared/middleware"
import { describeRoute, validator } from "hono-openapi"
import { actionSchema, tokenSchema } from "../../shared/schemas"
import z from "zod"
import {
  AppError,
  BadRequestError,
  BalanceTooLowError,
  ScriptExecutionError,
  UTxOContentionError,
  ValidationError,
} from "../../shared/errors"
import { CML, coreToUtxo, type TxBuilder } from "@lucid-evolution/lucid"
import {
  createBurnDjedOrder,
  createBurnShenOrder,
  createMintDjedOrder,
  createMintShenOrder,
} from "@open-djed/txs"
import {
  getChainTime,
  getLucid,
  getOracleUTxO,
  getPoolUTxO,
  registry,
} from "../../core"

const txRequestBodySchema = z.object({
  hexAddress: z.string(),
  utxosCborHex: z.array(z.string()),
})

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

export const tokensRouter = new Hono().post(
  "/:token/:action/:amount/tx",
  cacheMiddleware,
  describeRoute({
    summary: "Create a transaction",
    description: "Create a transaction to perform an action on a token.",
    tags: ["Transactions"],
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
  validator(
    "param",
    z.object({
      token: tokenSchema,
      action: actionSchema,
      amount: z.string(),
    }),
  ),
  validator("json", txRequestBodySchema),
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
