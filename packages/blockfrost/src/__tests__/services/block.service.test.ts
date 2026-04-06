import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { Network } from "../../types/network.types"
import { Blockfrost } from "../../client/blockfrostClient"
import { createLatestBlock } from "../factories/block/latestBlock.factory"
import { BlockfrostError } from "../../errors/blockfrost.error"

const mockBlock = createLatestBlock()
const apiKey = "test-api-key"

describe("BlockService", () => {
  let client: Blockfrost

  beforeEach(() => {
    client = new Blockfrost(apiKey, Network.MAINNET)

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockBlock), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return the latest block", async () => {
    const block = await client.blocks.getLatest()
    expect(block).toEqual(mockBlock)

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/blocks/latest"),
      expect.objectContaining({
        headers: { project_id: apiKey },
      }),
    )
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("should throw BlockfrostError on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404 }),
    )

    await expect(client.blocks.getLatest()).rejects.toThrow(BlockfrostError)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("should throw with correct status on error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Server Error", { status: 500 }),
    )

    await expect(client.blocks.getLatest()).rejects.toMatchObject({
      status: 500,
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([
    {
      status: 400,
      expectedCalls: 3,
    },
    {
      status: 403,
      expectedCalls: 3,
    },
    {
      status: 404,
      expectedCalls: 3,
    },
    {
      status: 418,
      expectedCalls: 3,
    },
    {
      status: 429,
      expectedCalls: 3,
    },
    {
      status: 500,
      expectedCalls: 1,
    },
    {
      status: 502,
      expectedCalls: 3,
    },
    {
      status: 503,
      expectedCalls: 3,
    },
  ])(
    "should handle $status $error correctly",
    async ({ status, expectedCalls }) => {
      vi.spyOn(global, "fetch").mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ status_code: status, message: "", error: "" }),
            { status, headers: { "Content-Type": "application/json" } },
          ),
        ),
      )

      const clientWithRetry = new Blockfrost(apiKey, Network.MAINNET, {
        attempts: 3,
      })

      await expect(clientWithRetry.blocks.getLatest()).rejects.toThrow(
        BlockfrostError,
      )
      expect(global.fetch).toHaveBeenCalledTimes(expectedCalls)
    },
  )
})
