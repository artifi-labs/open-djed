import { expect, test } from "vitest"
import {
  shenADAMintRate,
  adaSHENRate,
  shenADARate,
  shenADABurnRate,
  djedADARate,
  djedADAMintRate,
  djedADABurnRate,
  adaDJEDRate,
} from "./rate"

test("adaSHENRate", () => {
  expect(
    adaSHENRate(
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
    numerator: 5088149833027271553n,
    denominator: 5623088872975956835n,
  })
})

test("shenADARate", () => {
  expect(
    shenADARate(
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
    denominator: 5088149833027271553n,
  })
})

test("shenADAMintRate 1", () => {
  expect(
    shenADAMintRate(
      {
        adaInReserve: 31240837671805n,
        djedInCirculation: 3041800103658n,
        shenInCirculation: 23950207971999n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            numerator: 637341n,
            denominator: 1000000n,
          },
        },
      },
      {
        numerator: 3n,
        denominator: 200n,
      },
    ).simplify(),
  ).toEqual({
    numerator: 228297408242823847501n,
    denominator: 203525993321090862120n,
  })
})

test("shenADAMintRate 2", () => {
  expect(
    shenADAMintRate(
      {
        adaInReserve: 31240837671805n,
        djedInCirculation: 3041800103658n,
        shenInCirculation: 23950207971999n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            numerator: 10223n,
            denominator: 16000n,
          },
        },
      },
      {
        numerator: 3n,
        denominator: 200n,
      },
    ).simplify(),
  ).toEqual({
    numerator: 10990675043529581309n,
    denominator: 9793719043909831080n,
  })
})

test("shenADABurnRate", () => {
  expect(
    shenADABurnRate(
      {
        adaInReserve: 31240837671805n,
        djedInCirculation: 3041800103658n,
        shenInCirculation: 23950207971999n,
      },
      {
        oracleFields: {
          adaUSDExchangeRate: {
            numerator: 10223n,
            denominator: 16000n,
          },
        },
      },
      {
        numerator: 3n,
        denominator: 200n,
      },
    ).simplify(),
  ).toEqual({
    numerator: 10665827505297179891n,
    denominator: 9793719043909831080n,
  })
})

test("adaDJEDRate", () => {
  expect(
    adaDJEDRate({
      oracleFields: {
        adaUSDExchangeRate: {
          denominator: 1000000n,
          numerator: 637341n,
        },
      },
    }).simplify(),
  ).toEqual({
    numerator: 637341n,
    denominator: 1000000n,
  })
})

test("djedADARate", () => {
  expect(
    djedADARate({
      oracleFields: {
        adaUSDExchangeRate: {
          denominator: 1000000n,
          numerator: 637341n,
        },
      },
    }).simplify(),
  ).toEqual({
    numerator: 1000000n,
    denominator: 637341n,
  })
})

test("djedADAMintRate", () => {
  expect(
    djedADAMintRate(
      {
        oracleFields: {
          adaUSDExchangeRate: {
            denominator: 12500n,
            numerator: 7919n,
          },
        },
      },
      {
        numerator: 3n,
        denominator: 200n,
      },
    ).simplify(),
  ).toEqual({
    numerator: 25375n,
    denominator: 15838n,
  })
})

test("djedADABurnRate", () => {
  expect(
    djedADABurnRate(
      {
        oracleFields: {
          adaUSDExchangeRate: {
            denominator: 12500n,
            numerator: 7919n,
          },
        },
      },
      {
        numerator: 3n,
        denominator: 200n,
      },
    ).simplify(),
  ).toEqual({
    numerator: 24625n,
    denominator: 15838n,
  })
})
