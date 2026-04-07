import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import assert from "node:assert/strict"
import { Network } from "../../types"
import { Blockfrost } from "../../client/blockfrostClient"
import { BlockfrostError } from "../../errors/blockfrost.error"
import {
  createTransactionUtxo,
  createTransactionUtxoInput,
  createTransactionUtxoOutput,
} from "../factories/transaction/transactionUtxo.factory"

const mockUtxo = createTransactionUtxo()
const apiKey = "test-api-key"
const txHash =
  "1e043f100dce12d107f679685acd2fc0610e10f72a92d412794c9773d11d8477"

describe("TransactionsService", () => {
  let client: Blockfrost

  beforeEach(() => {
    client = new Blockfrost(apiKey, Network.MAINNET)

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockUtxo), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return transaction utxos", async () => {
    const utxo = await client.transactions.getTransactionUtxos(txHash)

    expect(utxo).toEqual(mockUtxo)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/txs/${txHash}/utxos`),
      expect.objectContaining({
        headers: { project_id: apiKey },
      }),
    )
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it("should return utxo with correct inputs and outputs shape", async () => {
    const utxo = await client.transactions.getTransactionUtxos(txHash)

    expect(utxo.hash).toBe(mockUtxo.hash)
    expect(utxo.inputs).toHaveLength(1)
    expect(utxo.outputs).toHaveLength(1)

    assert.ok(utxo.inputs[0])
    assert.ok(utxo.outputs[0])
    expect(utxo.inputs[0].tx_hash).toBeDefined()
    expect(utxo.inputs[0].reference).toBeDefined()
    expect(utxo.outputs[0].consumed_by_tx).toBeNull()
  })

  it("should handle multiple inputs and outputs", async () => {
    const mockMultiple = createTransactionUtxo({
      inputs: [
        createTransactionUtxoInput(),
        createTransactionUtxoInput({ tx_hash: "aaaa" }),
      ],
      outputs: [
        createTransactionUtxoOutput(),
        createTransactionUtxoOutput({ consumed_by_tx: "bbbb" }),
      ],
    })

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockMultiple), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const utxo = await client.transactions.getTransactionUtxos(txHash)

    expect(utxo.inputs).toHaveLength(2)
    expect(utxo.outputs).toHaveLength(2)

    assert.ok(utxo.outputs[1])
    expect(utxo.outputs[1].consumed_by_tx).toBe("bbbb")
  })

  it("should throw BlockfrostError on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404 }),
    )

    await expect(
      client.transactions.getTransactionUtxos(txHash),
    ).rejects.toThrow(BlockfrostError)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it("should throw with correct status on error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Server Error", { status: 500 }),
    )

    await expect(
      client.transactions.getTransactionUtxos(txHash),
    ).rejects.toMatchObject({ status: 500 })
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
