import { Data } from "@lucid-evolution/lucid"
import { AddressSchema } from "./address"

/*
{
  fields: [
    {
      fields: [ {
        int: number // how much DJED to mint
      }, {
        int: number // how much ADA to send to the pool
      } ],
      constructor: 0 // mint DJED
    } | {
      fields: [ {
        int: number // how much DJED to burn
      } ],
      constructor: 1 // burn DJED
    } | {
      fields: [ {
        int: number // how much SHEN to mint
      }, {
        int: number // how much ADA to send to the pool
      } ],
      constructor: 2 // mint SHEN
    } | {
      fields: [ {
        int: number // how much SHEN to burn
      } ],
      constructor: 3 // burn SHEN
    },
    {
      fields: [ // address of order creator
        {
            fields: [
                {
                    bytes: string // payment key hash of order creator
                }
            ],
            "constructor": 0
        },
        {
          "fields": [
            {
              "fields": [
                {
                  "fields": [
                    {
                      "bytes": string // stake key hash of order creator, probably nullable.
                    }
                  ],
                  "constructor": 0
                }
              ],
              "constructor": 0
            }
          ],
          "constructor": 0
        }
      ],
      "constructor": 0
    },
    {
      fields: [ { int: number }, { int: number } ],
      constructor: 0
    },
    {
      int: number // posix epoch, potentially expiry or creation date?
    },
    {
      bytes: string // DJED order token minting policy id
    }
  ],
  constructor: 0,
}
*/

const OrderDatumSchema = Data.Object({
  actionFields: Data.Enum([
    Data.Object({
      MintDJED: Data.Object({
        djedAmount: Data.Integer(),
        adaAmount: Data.Integer(),
      }),
    }),
    Data.Object({
      BurnDJED: Data.Object({
        djedAmount: Data.Integer(),
      }),
    }),
    Data.Object({
      MintSHEN: Data.Object({
        shenAmount: Data.Integer(),
        adaAmount: Data.Integer(),
      }),
    }),
    Data.Object({
      BurnSHEN: Data.Object({
        shenAmount: Data.Integer(),
      }),
    }),
  ]),
  address: AddressSchema,
  adaUSDExchangeRate: Data.Object({
    denominator: Data.Integer(),
    numerator: Data.Integer(),
  }),
  creationDate: Data.Integer(),
  orderStateTokenMintingPolicyId: Data.Bytes(),
})
export type OrderDatum = Data.Static<typeof OrderDatumSchema>
export const OrderDatum = OrderDatumSchema as unknown as OrderDatum
