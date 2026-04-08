import { getPeriodFeesEarnings } from "../../../client/feesEarnings"
import { getPeriodStakingRewards } from "../../../client/stakingRewards"
import type { ShenYield } from "../../types"
import { toDayString, buildDailyStakingRates } from "../../utils"

export async function calculateShenYield(): Promise<ShenYield[]> {
  const [stakingRewards, fees] = await Promise.all([
    getPeriodStakingRewards("All"),
    getPeriodFeesEarnings("All"),
  ])

  if (fees.length === 0 && stakingRewards.length === 0) {
    return []
  }

  const stakingByDay = buildDailyStakingRates(
    stakingRewards.map((reward) => ({
      ...reward,
      rate: Number(reward.rate),
    })),
  )

  const feesByDay = new Map(
    fees.map((fee) => [toDayString(fee.timestamp), Number(fee.rate ?? 0)]),
  )

  const firstFeeDay = fees[0] ? toDayString(fees[0].timestamp) : null
  const firstStakingDay = stakingRewards[0]
    ? toDayString(stakingRewards[0].timestamp)
    : null
  const firstSharedDay =
    firstFeeDay && firstStakingDay
      ? firstFeeDay > firstStakingDay
        ? firstFeeDay
        : firstStakingDay
      : null

  const dayKeys = [...new Set([...feesByDay.keys(), ...stakingByDay.keys()])]
    .sort()
    .filter((day) => !firstSharedDay || day >= firstSharedDay)

  const dailyYield: ShenYield[] = []
  for (const day of dayKeys) {
    const feeDailyRateRaw = feesByDay.get(day) ?? 0
    const feeDailyRate = Number.isFinite(feeDailyRateRaw) ? feeDailyRateRaw : 0
    const stakingDailyRate = Number.isFinite(stakingByDay.get(day))
      ? (stakingByDay.get(day) ?? 0) / 5 //Epoch days
      : 0

    const dailyRate = feeDailyRate + stakingDailyRate

    dailyYield.push({
      timestamp: new Date(`${day}T00:00:00.000Z`),
      yield: dailyRate,
    })
  }

  return dailyYield
}
