import { Data } from "@lucid-evolution/lucid"

const OracleDatumSchema = Data.Object({
  _0: Data.Bytes(),
  oracleFields: Data.Object({
    adaUSDExchangeRate: Data.Object({
      denominator: Data.Integer(),
      numerator: Data.Integer(),
    }),
    validityRange: Data.Object({
      lowerBound: Data.Tuple(
        [
          Data.Enum([
            Data.Object({ _1: Data.Object({ _2: Data.Any() }) }),
            Data.Object({ Value: Data.Tuple([Data.Integer()]) }),
          ]),
          Data.Nullable(Data.Any()),
        ],
        { hasConstr: true },
      ),
      upperBound: Data.Tuple(
        [
          Data.Enum([
            Data.Object({ _3: Data.Object({ _4: Data.Any() }) }),
            Data.Object({ Value: Data.Tuple([Data.Integer()]) }),
          ]),
          Data.Nullable(Data.Any()),
        ],
        { hasConstr: true },
      ),
    }),
    expressedIn: Data.Bytes(),
  }),
  oracleTokenPolicyId: Data.Bytes(),
})
export type OracleDatum = Data.Static<typeof OracleDatumSchema>
export const OracleDatum = OracleDatumSchema as unknown as OracleDatum
