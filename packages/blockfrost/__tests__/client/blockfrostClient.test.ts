import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { Network } from "../../src/types/network.types"
import { Blockfrost } from "../../src/client/blockfrostClient"
import { BlockfrostError } from "../../src/errors/blockfrost.error"
import { BlockService } from "../../src/services/block.service"
import { AddressService } from "../../src/services/address.service"
import { TransactionsService } from "../../src/services/transaction.service"
import { z } from "zod"

const apiKey = "test-api-key"
const mockSchema = z.object({ id: z.string() })
const mockData = { id: "test" }

const mockJsonResponse = (data: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  )

const mockErrorResponse = (status: number, error: string, message: string) =>
  Promise.resolve(
    new Response(JSON.stringify({ error, message, status_code: status }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  )

describe("Blockfrost", () => {
  let client: Blockfrost

  beforeEach(() => {
    client = new Blockfrost(apiKey, Network.MAINNET)
    vi.spyOn(global, "fetch").mockImplementation(() =>
      mockJsonResponse(mockData),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("constructor", () => {
    it("should initialise services", () => {
      expect(client.blocks).toBeInstanceOf(BlockService)
      expect(client.addresses).toBeInstanceOf(AddressService)
      expect(client.transactions).toBeInstanceOf(TransactionsService)
    })

    it("should use MAINNET as default network", () => {
      const defaultClient = new Blockfrost(apiKey)
      expect(defaultClient.network).toBe(Network.MAINNET)
    })

    it.each([
      { network: Network.MAINNET },
      { network: Network.PREVIEW },
      { network: Network.PREPROD },
    ])("should use the provided network", ({ network }) => {
      const client = new Blockfrost(apiKey, network)
      expect(client.network).toBe(network)
    })
  })

  describe("request", () => {
    it("should call the correct url", async () => {
      await client.request("/test", mockSchema)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.any(Object),
      )
    })

    it("should send the api key in headers", async () => {
      await client.request("/test", mockSchema)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { project_id: apiKey },
        }),
      )
    })

    it("should append query params to the url", async () => {
      await client.request("/test", mockSchema, { page: 1, count: 10 })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("page=1&count=10"),
        expect.any(Object),
      )
    })

    it("should ignore undefined query params", async () => {
      await client.request("/test", mockSchema, { page: undefined, count: 10 })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("count=10"),
        expect.any(Object),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining("page"),
        expect.any(Object),
      )
    })

    it("should parse and return the response", async () => {
      const result = await client.request("/test", mockSchema)
      expect(result).toEqual(mockData)
    })

    it("should throw BlockfrostError on non-ok response", async () => {
      vi.spyOn(global, "fetch").mockImplementation(() =>
        mockErrorResponse(404, "", ""),
      )

      await expect(client.request("/test", mockSchema)).rejects.toThrow(
        BlockfrostError,
      )
    })

    it("should throw if response does not match schema", async () => {
      vi.spyOn(global, "fetch").mockImplementation(() =>
        mockJsonResponse({ invalid: true }),
      )

      await expect(client.request("/test", mockSchema)).rejects.toThrow()
    })
  })

  describe("paginate", () => {
    it("should return a PaginatedRequest", () => {
      const result = client.paginate("/test", z.array(mockSchema))
      expect(result).toBeDefined()
      expect(typeof result.allPages).toBe("function")
    })

    it("should pass query params to each page request", async () => {
      vi.spyOn(global, "fetch").mockImplementation(() => mockJsonResponse([]))

      await client
        .paginate("/test", z.array(mockSchema), { order: "desc" })
        .allPages()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("order=desc"),
        expect.any(Object),
      )
    })
  })

  describe("Retry", () => {
    it("should override global retry with request retry", async () => {
      vi.spyOn(global, "fetch")
        .mockImplementationOnce(() => mockErrorResponse(400, "", ""))
        .mockImplementationOnce(() => mockJsonResponse(mockData))

      const clientWithRetry = new Blockfrost(apiKey, Network.MAINNET, {
        attempts: 1,
      })

      const result = await clientWithRetry
        .request("/test", mockSchema)
        .retry({ attempts: 2 })
      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it.each([
      { status: 200, retriesAttempt: 2, expectedCalls: 2 },
      { status: 400, retriesAttempt: 2, expectedCalls: 2 },
      { status: 403, retriesAttempt: 3, expectedCalls: 2 },
      { status: 404, retriesAttempt: 2, expectedCalls: 2 },
      { status: 418, retriesAttempt: 2, expectedCalls: 2 },
      { status: 429, retriesAttempt: 2, expectedCalls: 2 },
    ])("Should retry", async ({ status, retriesAttempt, expectedCalls }) => {
      vi.spyOn(global, "fetch")
        .mockImplementationOnce(() => mockErrorResponse(status, "", "message"))
        .mockImplementationOnce(() => mockJsonResponse(mockData))

      const client = new Blockfrost(apiKey, Network.MAINNET, {
        attempts: retriesAttempt,
      })

      const result = await client.request("/test", mockSchema)
      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledTimes(expectedCalls)
    })

    it.each([{ status: 500, retriesAttempt: 3, expectedCalls: 1 }])(
      "Should not retry",
      async ({ status, retriesAttempt, expectedCalls }) => {
        vi.spyOn(global, "fetch")
          .mockImplementationOnce(() => mockErrorResponse(status, "", ""))
          .mockImplementationOnce(() => mockJsonResponse(mockData))

        const client = new Blockfrost(apiKey, Network.MAINNET, {
          attempts: retriesAttempt,
        })

        await expect(client.request("/test", mockSchema)).rejects.toThrow(
          BlockfrostError,
        )
        expect(global.fetch).toHaveBeenCalledTimes(expectedCalls)
      },
    )
  })
})
