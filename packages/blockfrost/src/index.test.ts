import { describe, expect, it, vi } from "vitest"
import { fetchJSON } from "./utils"
import { Blockfrost } from "."
import { makeAddressTransaction, makeAddressTransactions } from "../tests/factories/AddressTransactionsFactory"
import { beforeEach } from "vitest"

vi.mock("./utils", () => ({
  fetchJSON: vi.fn(),
}))

describe("getAddressTransactions", () => {
  const bf = new Blockfrost("https://api", "key")
  const mockedFetch = vi.mocked(fetchJSON)

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("should return transactions from single page", async () => {
    const fakeData = makeAddressTransactions(2)

    vi.mocked(fetchJSON).mockResolvedValueOnce(fakeData)

    const result = await bf.getAddressTransactions({
      address: "addr_test1...",
    })

    expect(fetchJSON).toHaveBeenCalledTimes(1)
    expect(result).toEqual(fakeData)
  })

  it("should fetch multiple pages", async () => {

    mockedFetch
      .mockResolvedValueOnce([makeAddressTransaction({ tx_index: 0 })])
      .mockResolvedValueOnce([makeAddressTransaction({ tx_index: 1 })])

    const result = await bf
      .getAddressTransactions({ address: "addr_test" })
      .allPages({ count: 1 })

    expect(result).toHaveLength(2)
    expect(mockedFetch).toHaveBeenCalledTimes(3) // 2 pages + 1 fetch to stop
  })

  it("should stop fetching after maxPages is reached", async () => {

    const expectedresult = [makeAddressTransaction({ tx_index: 0 })]

    mockedFetch
      .mockResolvedValueOnce(expectedresult)
      .mockResolvedValueOnce([makeAddressTransaction({ tx_index: 1 })])
      .mockResolvedValueOnce([makeAddressTransaction({ tx_index: 1 })])

    const result = await bf
      .getAddressTransactions({ address: "addr_test" })
      .allPages({ count: 1, maxPages: 1 })

    expect(result).toHaveLength(1)
    expect(result).toEqual(expectedresult)
    expect(mockedFetch).toHaveBeenCalledTimes(1)
  })

  it("should stop fetching when block_time is older than latestPriceTimestamp", async () => {
    const nowSec = Number(Math.floor(Date.now() / 1000))

    const recentTx = makeAddressTransaction({
      block_time: nowSec - 1000_000,
      tx_index: 0,
    })

    const secondTx = makeAddressTransaction({
      block_time: nowSec - 100_000,
      tx_index: 1,
    })

    const thirdTx = makeAddressTransaction({
      block_time: nowSec - 10_000,
      tx_index: 2,
    })

    mockedFetch
      .mockResolvedValueOnce([recentTx])
      .mockResolvedValueOnce([secondTx])
      .mockResolvedValueOnce([thirdTx])

    const expectedTimestamp = new Date((nowSec - 200_000) * 1000)
    const ExpectedTimestampSec = Math.floor(
      expectedTimestamp.getTime() / 1000
    )

    const result = await bf.getAddressTransactions({
      address: "addr_test",
    }).withFilter(() => ({
        filter: (item) => item.block_time < ExpectedTimestampSec,
        stop: (item) => item.block_time > ExpectedTimestampSec,
      }))
      .allPages({count: 1})

    expect(result).toEqual([recentTx])
    expect(mockedFetch).toHaveBeenCalledTimes(2)
  })
})