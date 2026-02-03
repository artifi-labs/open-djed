import { expect, test } from "vitest"
import { djedADAMarketCap, djedUSDMarketCap } from "./market-cap"

test("djedUSDMarketCap", () => {
  expect(
    djedUSDMarketCap({
      adaInReserve: 31240837671805n,
      djedInCirculation: 3041800103658n,
      shenInCirculation: 23950207971999n,
    }).simplify(),
  ).toEqual({ numerator: 3041800103658n, denominator: 1n })
})

test("djedADAMarketCap", () => {
  expect(
    djedADAMarketCap(
      {
        adaInReserve: 31240837671805n,
        djedInCirculation: 3041800103658n,
        shenInCirculation: 23950207971999n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            denominator: 1000000n,
            numerator: 637341n,
          },
        },
      },
    ).simplify(),
  ).toEqual({ denominator: 212447n, numerator: 1013933367886000000n })
})
