import { expect, test } from "vitest"
import {
  djedADAMarketCap,
  djedInCirculation,
  djedUSDMarketCap,
  shenADAMarketCap,
  shenInCirculation,
  shenUSDMarketCap,
} from "./market-cap"

test("djedInCirculation", () => {
  expect(
    djedInCirculation({
      djedInCirculation: 3041800103658n,
    }).simplify(),
  ).toEqual({ numerator: 3041800103658n, denominator: 1n })
})

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

test("shenInCirculation", () => {
  expect(
    shenInCirculation({
      shenInCirculation: 23950207971999n,
    }).simplify(),
  ).toEqual({ numerator: 23950207971999n, denominator: 1n })
})

test("shenUSDMarketCap", () => {
  expect(
    shenUSDMarketCap(
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
  ).toEqual({ numerator: 3373853323785574101n, denominator: 200000n })
})

test("shenADAMarketCap", () => {
  expect(
    shenADAMarketCap(
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
  ).toEqual({
    numerator: 5623088872975956835n,
    denominator: 212447n,
  })
})
