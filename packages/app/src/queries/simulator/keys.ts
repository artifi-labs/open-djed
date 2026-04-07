export const simulatorKeys = {
  all: ["simulator"] as const,

  stakingRewards: (startDate: string, endDate: string) =>
    [...simulatorKeys.all, "stakingRewards", startDate, endDate] as const,

  feesEarnings: (startDate: string, endDate: string) =>
    [...simulatorKeys.all, "feesEarnings", startDate, endDate] as const,
}
