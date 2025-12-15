import { Data } from "@lucid-evolution/lucid"
import { expect, test } from "vitest"
import { OrderDatum } from "./order-datum"

test("order datum from", () => {
  expect(
    Data.from(
      "d8799fd87a9f1a3b9aca00ffd8799fd8799f581c7a3a250a9ec1b52fb4811ad0aa7a62df0a9667daf7a9bea3248a371affd8799fd8799fd8799f581cb652ad81db60f5d8605dcec6e73d1ed932009651d9f3e8580ee07d22ffffffffd8799f1927101918a5ff1b000001961c44a558581c04ea363a127872366ef2d3186325a25a5cee8826ff8a79dc7c8fa671ff",
      OrderDatum,
    ),
  ).toEqual({
    actionFields: {
      BurnDJED: {
        djedAmount: 1000000000n,
      },
    },
    address: {
      paymentKeyHash: [
        "7a3a250a9ec1b52fb4811ad0aa7a62df0a9667daf7a9bea3248a371a",
      ],
      stakeKeyHash: [
        [["b652ad81db60f5d8605dcec6e73d1ed932009651d9f3e8580ee07d22"]],
      ],
    },
    adaUSDExchangeRate: {
      denominator: 10000n,
      numerator: 6309n,
    },
    creationDate: 1744230983000n,
    orderStateTokenMintingPolicyId:
      "04ea363a127872366ef2d3186325a25a5cee8826ff8a79dc7c8fa671",
  } as OrderDatum)
})

test("order datum to", () => {
  expect(
    Data.to(
      {
        actionFields: {
          BurnDJED: {
            djedAmount: 1000000000n,
          },
        },
        address: {
          paymentKeyHash: [
            "7a3a250a9ec1b52fb4811ad0aa7a62df0a9667daf7a9bea3248a371a",
          ],
          stakeKeyHash: [
            [["b652ad81db60f5d8605dcec6e73d1ed932009651d9f3e8580ee07d22"]],
          ],
        },
        adaUSDExchangeRate: {
          denominator: 10000n,
          numerator: 6309n,
        },
        creationDate: 1744230983000n,
        orderStateTokenMintingPolicyId:
          "04ea363a127872366ef2d3186325a25a5cee8826ff8a79dc7c8fa671",
      },
      OrderDatum,
    ),
  ).toEqual(
    "d8799fd87a9f1a3b9aca00ffd8799fd8799f581c7a3a250a9ec1b52fb4811ad0aa7a62df0a9667daf7a9bea3248a371affd8799fd8799fd8799f581cb652ad81db60f5d8605dcec6e73d1ed932009651d9f3e8580ee07d22ffffffffd8799f1927101918a5ff1b000001961c44a558581c04ea363a127872366ef2d3186325a25a5cee8826ff8a79dc7c8fa671ff",
  )
})
