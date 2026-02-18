import type { TransactionUtxoResponse } from "@open-djed/blockfrost/src/types/transaction/transactionUtxo"
import path from "path"
import JSONbig from "json-bigint"
import fsPromises from "fs/promises"
import { DEX_CONFIG, type DexKey } from "../../../../dex.config"
import type { DexDailyPrices, DexPriceEntry } from "../../../../types/dex"

// TODO: DELETE THIS
export async function readUtxoFile(
  filePath: string,
): Promise<TransactionUtxoResponse[]> {
  const absolutePath = path.resolve(filePath)

  const raw = await fsPromises.readFile(absolutePath, "utf-8")
  const parsed = JSONbig.parse(raw) as TransactionUtxoResponse[]
  return parsed
}

// TODO: DELETE THIS
export async function writeDexPricesToFile(
  data: DexDailyPrices[],
  filePath: string = "./dexPrices.json",
): Promise<void> {
  const absolutePath = path.resolve(filePath)
  const json = JSONbig.stringify(data)
  await fsPromises.writeFile(absolutePath, json, { encoding: "utf-8" })
}

// TODO: DELETE THIS
export async function readDexPricesFromFile(
  filePath: string = "./dexPrices.json",
): Promise<DexDailyPrices[]> {
  const absolutePath = path.resolve(filePath)
  const raw = await fsPromises.readFile(absolutePath, "utf-8")
  const parsed = JSONbig.parse(raw) as DexDailyPrices[]
  return parsed.map(entry => ({
    ...entry,
    day: new Date(entry.day),
  }))
}

export const normalizeDexKey = (dex: string): DexKey | null => {
  const normalized = dex.toLowerCase()

  return (normalized in DEX_CONFIG
    ? normalized
    : null) as DexKey | null
}

export function aggegatedDexPricesPerDay(dexsPricesPerDay: DexDailyPrices[][]): DexDailyPrices[] {
  const aggregated: Record<string, DexPriceEntry[]> = {}
  
  dexsPricesPerDay.forEach(dexPrices => {
    dexPrices.forEach(dayEntry => {
      const dayKey = dayEntry.day.toISOString()
      if (!aggregated[dayKey]) {
        aggregated[dayKey] = []
      }
      aggregated[dayKey].push(...dayEntry.prices)
    })
  })

  return Object.entries(aggregated).map(([day, prices]) => ({
    day: new Date(day),
    prices,
  }))
}
