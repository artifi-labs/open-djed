const TIME_UNITS = [
  1, 3, 6, 12, 24, 48, 168, 720, 2160, 4320, 8760, 17520, 43800, 87600,
]

function getTimeInterval(
  totalHours: number,
  maxPoints: number = 12,
): number | undefined {
  return (
    TIME_UNITS.find((u) => totalHours / u <= maxPoints) ?? TIME_UNITS.at(-1)
  )
}

export function useTimeInterval(
  start: number,
  end: number,
  maxPoints = 12,
): number | undefined {
  const hourInMs = 60 * 60 * 1000
  const totalHours = (end - start) / hourInMs
  const interval = getTimeInterval(totalHours, maxPoints)
  return interval ? interval * hourInMs : undefined
}

export function getAnalyticsTimeInterval(totalDays: number, isMobile: boolean) {
  const dayInMs = 24 * 60 * 60 * 1000
  let newInterval
  if (totalDays <= 10) {
    //1 week
    newInterval = dayInMs
  } else if (totalDays <= 31) {
    // 1 month
    newInterval = isMobile ? 7 * dayInMs : 3 * dayInMs
  } else if (totalDays <= 365) {
    // 1 year
    newInterval = isMobile ? 30 * dayInMs : 60 * dayInMs
  } else {
    newInterval = isMobile ? 60 * dayInMs : 90 * dayInMs
  }

  return newInterval
}
