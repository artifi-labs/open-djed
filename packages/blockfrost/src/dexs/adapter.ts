import type { Constr, Data } from "@lucid-evolution/lucid"

export interface DexAdapter<DexName extends string = string, TDatum = unknown> {
  name: DexName
  fromPlutusData: (data: Data) => TDatum
}

export type AnyDexAdapter = DexAdapter<string, unknown>
