import { type Constr, type Data } from "@lucid-evolution/lucid"
import type { DexAdapter } from "./adapter"
import z from "zod"

export const MinswapDatumSchema = z.object({
  totalLiquidity: z.bigint(),
  reserveA: z.bigint(),
  reserveB: z.bigint(),
  baseFee: z.object({
    feeANumerator: z.bigint(),
    feeBNumerator: z.bigint(),
  }),
})

export type MinswapDatum = z.infer<typeof MinswapDatumSchema>


export const minswapAdapter: DexAdapter<"minswap", MinswapDatum> = {
  name: "minswap",

  fromPlutusData(data: Data): MinswapDatum {
    const constr = data as Constr<Data>
    
    if (constr.index !== 0) {
      throw new Error(`Expected Constr index 0, got: ${constr.index}`)
    }

    if (constr.fields.length < 8) {
      throw new Error(`Expected at least 8 fields, got: ${constr.fields.length}`)
    }

    return MinswapDatumSchema.parse({
      totalLiquidity: constr.fields[3],
      reserveA: constr.fields[4],
      reserveB: constr.fields[5],
      baseFee: {
        feeANumerator: constr.fields[6],
        feeBNumerator: constr.fields[7],
      },
    })
  }
}
