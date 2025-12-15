import { Data } from "@lucid-evolution/lucid"

/*
{
  constructor: 0,
  fields: [
    { int: number }, // how much ADA is in the pool.
    { int: number }, // how much DJED is in circulation.
    { int: number }, // how much SHEN is in circulation.
    {
      "fields": [ // last action (mint djed, burn djed, mint shen, burn shen).
        {
          "fields": [
            {
              "fields": [
                {
                  "fields": [
                      {
                          "bytes": "d0804300556b9f74886628733ae3552673d500e4ac5152ed7259d6efdbd2ad64" // tx hash
                      }
                  ],
                  "constructor": 0
                },
                {
                  "int": 0 // output index
                }
              ],
              "constructor": 0
            },
            {
                "int": 1744230983000 // time in output datum
            }
          ],
          "constructor": 0
        }
      ],
      "constructor": 0
    },
    {
      "int": 1823130
    },
    {
      "int": 1530050
    },
    { // Null
      "fields": [],
      "constructor": 1
    },
    { // Minting policy of DJED, SHEN and `DjedStableCoinNFT` token.
      "bytes": "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61"
    },
    { // Unique reference of output used for DJED, SHEN, `DjedStableCoinNFT` token one-shot minting policy.
      "fields": [
        {
          "fields": [
            {
              "bytes": "362e24ab3b1aacf8108c52aec7ddc6c2e007fef3c3a125eebe849a0be4203902"
            }
          ],
          "constructor": 0
        },
        {
          "int": 0
        }
      ],
      "constructor": 0
    },
    { // Output reference (not sure of what)
      "fields": [
        {
          "fields": [
            {
              "bytes": "37116bb7647aeccd235c4e3dbd8e186bb209ca2eef7fc801298d96727e8d3879"
            }
          ],
          "constructor": 0
        },
        {
          "int": 0
        }
      ],
      "constructor": 0
    }
    ],
    "constructor": 0
  ]
}
*/

const OutputReferenceSchema = Data.Object({
  txHash: Data.Tuple([Data.Bytes()], { hasConstr: true }),
  outputIndex: Data.Integer(),
})

const PoolDatumSchema = Data.Object({
  adaInReserve: Data.Integer(),
  djedInCirculation: Data.Integer(),
  shenInCirculation: Data.Integer(),
  lastOrder: Data.Tuple(
    [
      Data.Object({
        order: OutputReferenceSchema,
        time: Data.Integer(),
      }),
    ],
    { hasConstr: true },
  ),
  minADA: Data.Integer(),
  _1: Data.Integer(),
  _2: Data.Nullable(Data.Any()),
  mintingPolicyId: Data.Bytes(),
  mintingPolicyUniqRef: OutputReferenceSchema,
  _3: OutputReferenceSchema,
})
export type PoolDatum = Data.Static<typeof PoolDatumSchema>
export const PoolDatum = PoolDatumSchema as unknown as PoolDatum
