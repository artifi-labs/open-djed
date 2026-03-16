import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { Network } from "../../src/types/network.types"
import { BlockfrostClient } from "../../src/client/blockfrostClient"
import { createLatestBlock } from "../factories/block/latestBlock.factory"
import { BlockfrostError } from "../../src/errors/blockfrost.error"

const mockBlock = createLatestBlock()
const apiKey = "test-api-key"

describe("BlockService", () => {
  let client: BlockfrostClient

  beforeEach(() => {
    client = new BlockfrostClient(apiKey, Network.MAINNET)

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
})