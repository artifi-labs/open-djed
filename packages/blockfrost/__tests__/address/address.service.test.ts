import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { Network } from "../../src/types/network.types"
import { BlockfrostClient } from "../../src/client/blockfrostClient"
import { BlockfrostError } from "../../src/errors/blockfrost.error"
import { createAddressTransaction } from "../factories/addresses/addressTransaction.factory"

const mockAddressTransaction = createAddressTransaction()
const mockResponse = [mockAddressTransaction]
const apiKey = "test-api-key"
const address = "addr1213"

describe("AddressService", () => {
  let client: BlockfrostClient

  beforeEach(() => {
    client = new BlockfrostClient(apiKey, Network.MAINNET)

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return address transactions", async () => {
    const txs = await client.addresses.getAddressTransactions(address)

    expect(txs).toEqual(mockResponse)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/addresses/${address}/transactions`),
      expect.objectContaining({
        headers: { project_id: apiKey },
      }),
    )
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it("should return all pages of address transactions", async () => {
    const page1 = [createAddressTransaction(), createAddressTransaction()]
    const page2 = [createAddressTransaction()]

    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(page1), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page2), { status: 200, headers: { "Content-Type": "application/json" } }))

    const txs = await client.addresses.getAddressTransactions(address).allPages({ count: 2 })

    expect(txs).toEqual([...page1, ...page2])
    expect(global.fetch).toHaveBeenCalledTimes(2) // Should fetch 2 times: page 1, page 2
  })

  it("should stop after finding the first transaction", async () => {
    const expectedTransaction = createAddressTransaction({ tx_hash: "test-stop" })
    const page1 = [createAddressTransaction(), expectedTransaction]
    const page2 = [expectedTransaction]

    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(page1), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page2), { status: 200, headers: { "Content-Type": "application/json" } }))

    const txs = await client.addresses.getAddressTransactions(address, { order: "asc" }).allPages({ count: 2, filter: (tx) => tx.tx_hash === "test-stop", stopAfter: (tx) => tx.tx_hash === "test-stop" })

    expect(txs).toEqual([expectedTransaction])
    expect(global.fetch).toHaveBeenCalledTimes(1) // Should fetch 1 time: page 1
  })

  it("should throw BlockfrostError on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404 }),
    )

    await expect(
      client.addresses.getAddressTransactions(address)
    ).rejects.toThrow(BlockfrostError)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it("should throw with correct status on error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Server Error", { status: 500 }),
    )

    await expect(
      client.addresses.getAddressTransactions(address)
    ).rejects.toMatchObject({ status: 500 })
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})