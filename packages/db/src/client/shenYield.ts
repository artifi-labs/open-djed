import type { Period } from "../sync/types"
import { getStartIso } from "../sync/utils"
import { calculateShenYield } from "../sync/analytics/shenYield/shenYield"

const serializeShenYield = (
  entries: Awaited<ReturnType<typeof calculateShenYield>>,
) =>
  entries.map((entry) => ({
    timestamp: entry.timestamp,
    yield: entry.yield.toString(),
  }))

export const getPeriodShenYield = async (period: Period) => {
  const startIso = getStartIso(period)
  const derivedYield = serializeShenYield(await calculateShenYield())

  if (!startIso) return derivedYield

  return derivedYield.filter((entry) => entry.timestamp >= startIso)
}

export const getLast60DaysShenYield = async () => {
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const derivedYield = serializeShenYield(await calculateShenYield())
  return derivedYield.filter((entry) => entry.timestamp >= sixtyDaysAgo)
}
