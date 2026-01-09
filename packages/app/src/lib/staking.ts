export type CreditEntry = {
  date: string // ISO date
  daysSinceLastCredit: number
  reward: number
  balanceAfter: number
  credited: boolean
}

type StakingResult = {
  totalCreditedRewards: number
  totalPendingRewards: number
  credits: CreditEntry[]
}

const DAY_MS = 24 * 60 * 60 * 1000 // ms in a 24h cycle
const WAIT_DAYS = 20 // initial waiting period to start receiving rewards
const INTERVAL_DAYS = 5 // rewards are accredited every 5 days

// Calculate expected staking return for a principal between two dates given APR, 20-day wait,
// and 5-day accreditation interval. Rewards compound at each accreditation.
export function expectedStakingReturn(
  initialBalance: number,
  initialDate: Date | string,
  finishDate: Date | string,
  opts: { aprPercent?: number; includePending?: boolean } = {},
): StakingResult {
  const aprPercent = opts.aprPercent ?? 2.5 //2.4%-2.5% annual APY
  const includePending = opts.includePending ?? false
  const start = new Date(initialDate)
  const end = new Date(finishDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Dates are not valid ISO format")
  }

  if (end <= start) {
    return {
      credits: [],
      totalCreditedRewards: 0,
      totalPendingRewards: 0,
    }
  }

  const firstCreditDate = new Date(start.getTime() + WAIT_DAYS * DAY_MS)

  const credits: CreditEntry[] = []
  let currentBalance = initialBalance
  let lastCreditDate = start

  // Check if first rewards are accredited after finish date
  if (firstCreditDate > end) {
    return {
      credits: [],
      totalCreditedRewards: 0,
      totalPendingRewards: 0,
    }
  }

  // Process all credited rewards
  // Rewards are credited every 5 days
  let creditDate = firstCreditDate
  while (creditDate <= end) {
    const periodDays =
      (creditDate.getTime() - lastCreditDate.getTime()) / DAY_MS
    const reward = calculateReward(currentBalance, aprPercent, periodDays)
    currentBalance += reward

    credits.push({
      date: creditDate.toISOString(),
      daysSinceLastCredit: periodDays,
      reward,
      balanceAfter: currentBalance,
      credited: true,
    })

    lastCreditDate = creditDate
    creditDate = new Date(creditDate.getTime() + INTERVAL_DAYS * DAY_MS)
  }

  // Calculate pending rewards
  const pendingDays = (end.getTime() - lastCreditDate.getTime()) / DAY_MS
  const pendingReward =
    includePending && pendingDays > 0
      ? calculateReward(currentBalance, aprPercent, pendingDays)
      : 0

  if (pendingReward > 0) {
    credits.push({
      date: end.toISOString(),
      daysSinceLastCredit: pendingDays,
      reward: pendingReward,
      balanceAfter: currentBalance + pendingReward,
      credited: false,
    })
  }

  const totalCreditedRewards = credits
    .filter((c) => c.credited)
    .reduce((sum, c) => sum + c.reward, 0)

  const totalPendingRewards = credits
    .filter((c) => !c.credited)
    .reduce((sum, c) => sum + c.reward, 0)

  return {
    credits,
    totalCreditedRewards,
    totalPendingRewards,
  }
}

function calculateReward(
  balance: number,
  aprPercent: number,
  days: number,
): number {
  return balance * (aprPercent / 100) * (days / 365)
}
