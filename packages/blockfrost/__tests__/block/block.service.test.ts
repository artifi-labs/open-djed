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

  it.each([
  { status: 400, error: "Bad Request", message: "Invalid address.", expectedCalls: 3 },
  { status: 403, error: "Forbidden",  message: "Invalid project token.", expectedCalls: 3 },
  { status: 404, error: "Not Found", message: "Component not found.", expectedCalls: 3 },
  { status: 418, error: "Rate Limited", message: "Usage over limit.", expectedCalls: 3 },
  { status: 429, error: "Too Many Requests", message: "Usage over limit.", expectedCalls: 3 },
  { status: 500, error: "Internal Server Error", message: "Unexpected response.", expectedCalls: 1 },
  { status: 502, error: "Bad Gateway", message: "Backend fetch failed.", expectedCalls: 3 },
  { status: 503, error: "Service Unavailable", message: "Service unavailable.", expectedCalls: 3 },
])("should handle $status $error correctly", async ({ status, error, message, expectedCalls }) => {
  vi.spyOn(global, "fetch").mockImplementation(() =>
    Promise.resolve(new Response(
      JSON.stringify({ error, message, status_code: status }),
      { status, headers: { "Content-Type": "application/json" } },
    ))
  )

  const clientWithRetry = new BlockfrostClient(apiKey, Network.MAINNET, { attempts: 3 })

  await expect(clientWithRetry.blocks.getLatest()).rejects.toThrow(BlockfrostError)
  expect(global.fetch).toHaveBeenCalledTimes(expectedCalls)
})
})