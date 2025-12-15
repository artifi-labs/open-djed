import { Data } from "@lucid-evolution/lucid"
import { expect, test } from "vitest"
import { OracleDatum } from "./oracle-datum"

test("oracle datum from", () => {
  expect(
    Data.from(
      "d8799f5840baf00a3eaa2919ef46bbdc67cfe6b50819a64781189d95317a8183c34bdce1cb32647a5bbe7950c97ec31c601064fbd255bb69a52d8b7c8b1f706e1aba3deb07d8799fd8799f19c350196ce7ffd8799fd8799fd87a9f1b0000019617d34560ffd87a80ffd8799fd87a9f1b0000019617e10100ffd87a80ffff43555344ff581c815aca02042ba9188a2ca4f8ce7b276046e2376b4bce56391342299eff",
      OracleDatum,
    ),
  ).toEqual({
    _0: "baf00a3eaa2919ef46bbdc67cfe6b50819a64781189d95317a8183c34bdce1cb32647a5bbe7950c97ec31c601064fbd255bb69a52d8b7c8b1f706e1aba3deb07",
    oracleFields: {
      adaUSDExchangeRate: {
        numerator: 27879n,
        denominator: 50000n,
      },
      validityRange: {
        lowerBound: [
          {
            Value: [1744156444000n],
          },
          null,
        ],
        upperBound: [
          {
            Value: [1744157344000n],
          },
          null,
        ],
      },
      expressedIn: "555344",
    },
    oracleTokenPolicyId:
      "815aca02042ba9188a2ca4f8ce7b276046e2376b4bce56391342299e",
  })
})

test("oracle datum to", () => {
  expect(
    Data.to(
      {
        _0: "baf00a3eaa2919ef46bbdc67cfe6b50819a64781189d95317a8183c34bdce1cb32647a5bbe7950c97ec31c601064fbd255bb69a52d8b7c8b1f706e1aba3deb07",
        oracleFields: {
          adaUSDExchangeRate: {
            denominator: 50000n,
            numerator: 27879n,
          },
          validityRange: {
            lowerBound: [
              {
                Value: [1744156444000n],
              },
              null,
            ],
            upperBound: [
              {
                Value: [1744157344000n],
              },
              null,
            ],
          },
          expressedIn: "555344",
        },
        oracleTokenPolicyId:
          "815aca02042ba9188a2ca4f8ce7b276046e2376b4bce56391342299e",
      },
      OracleDatum,
    ),
  ).toEqual(
    "d8799f5840baf00a3eaa2919ef46bbdc67cfe6b50819a64781189d95317a8183c34bdce1cb32647a5bbe7950c97ec31c601064fbd255bb69a52d8b7c8b1f706e1aba3deb07d8799fd8799f19c350196ce7ffd8799fd8799fd87a9f1b0000019617d34560ffd87a80ffd8799fd87a9f1b0000019617e10100ffd87a80ffff43555344ff581c815aca02042ba9188a2ca4f8ce7b276046e2376b4bce56391342299eff",
  )
})
