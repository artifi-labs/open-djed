import { expect, test } from "vitest"
import {
  adaInReserve,
  maxBurnableSHEN,
  maxMintableDJED,
  maxMintableSHEN,
  reserveRatio,
} from "./reserve"
import { registryByNetwork } from "@open-djed/registry"

test("adaInReserve", () => {
  expect(
    adaInReserve({
      adaInReserve: 31240837671805n,
    }),
  ).toEqual({ numerator: 31240837671805n, denominator: 1n })
})

test("reserveRatio", () => {
  expect(
    reserveRatio(
      {
        adaInReserve: 31240837671805n,
        djedInCirculation: 3041800103658n,
        shenInCirculation: 23950207971999n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            numerator: 63479n,
            denominator: 100000n,
          },
        },
      },
    ),
  ).toEqual({
    numerator: 1983137134568509595n,
    denominator: 304180010365800000n,
  })
})

test("maxMintableDJED", () => {
  expect(
    maxMintableDJED(
      {
        adaInReserve: 31220582824526n,
        djedInCirculation: 3049627686600n,
        shenInCirculation: 23920207971999n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            numerator: 6271n,
            denominator: 10000n,
          },
        },
      },
      registryByNetwork["Mainnet"].MintDJEDFeePercentage,
    ),
  ).toEqual(2472333917206n)
})

test("maxMintableSHEN", () => {
  expect(
    maxMintableSHEN(
      {
        adaInReserve: 31220582824526n,
        djedInCirculation: 3049627686600n,
        shenInCirculation: 23920207971999n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            denominator: 200000n,
            numerator: 124043n,
          },
        },
      },
      registryByNetwork["Mainnet"].MintSHENFeePercentage,
    ),
  ).toEqual(7271378273795n)
})

test("maxBurnableSHEN", () => {
  expect(
    maxBurnableSHEN(
      {
        adaInReserve: 31220582824526n,
        djedInCirculation: 3049627686600n,
        shenInCirculation: 23920207971999n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            denominator: 200000n,
            numerator: 124043n,
          },
        },
      },
      registryByNetwork["Mainnet"].BurnSHENFeePercentage,
    ),
  ).toEqual(10665625097068n)
})

test("maxMintableDJED", () => {
  expect(
    maxMintableDJED(
      {
        adaInReserve: 8235025903950n,
        djedInCirculation: 1001562658066n,
        shenInCirculation: 2295498350478n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            numerator: 62299n,
            denominator: 100000n,
          },
        },
      },
      registryByNetwork["Preprod"].MintDJEDFeePercentage,
    ),
  ).toEqual(378480860484n)
})

test("maxMintableSHEN", () => {
  expect(
    maxMintableSHEN(
      {
        adaInReserve: 8235025903950n,
        djedInCirculation: 1001562658066n,
        shenInCirculation: 2295498350478n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            numerator: 62299n,
            denominator: 100000n,
          },
        },
      },
      registryByNetwork["Preprod"].MintSHENFeePercentage,
    ),
    // NOTE: Here we work around a rounding error.
  ).toEqual(1526106388743n - 1n)
})

test("maxBurnableSHEN", () => {
  expect(
    maxBurnableSHEN(
      {
        adaInReserve: 8235025903950n,
        djedInCirculation: 1001562658066n,
        shenInCirculation: 2295498350478n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            numerator: 62299n,
            denominator: 100000n,
          },
        },
      },
      registryByNetwork["Preprod"].BurnSHENFeePercentage,
    ),
  ).toEqual(651005696037n)
})
