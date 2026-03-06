import { type ShenYieldChartEntry } from "@/components/analytics/useAnalyticsData"

export const calculateProjectedYield = (
  data: ShenYieldChartEntry[],
  projectionDays: number = 60,
): ShenYieldChartEntry[] => {
  if (data.length < 2) return []

  const startTime = new Date(data[0].timestamp).getTime()
  const avgIntervalMs =
    (new Date(data[data.length - 1].timestamp).getTime() - startTime) /
    (data.length - 1)

  const points = data.map((d) => ({
    x: (new Date(d.timestamp).getTime() - startTime) / avgIntervalMs,
    y: d.yield,
  }))

  const n = points.length
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0

  for (const p of points) {
    sumX += p.x
    sumY += p.y
    sumXY += p.x * p.y
    sumXX += p.x * p.x
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const projection: ShenYieldChartEntry[] = []
  const lastEntry = data[data.length - 1]
  const lastTimestamp = new Date(lastEntry.timestamp).getTime()
  const projectionSteps = Math.round(
    (projectionDays * 24 * 60 * 60 * 1000) / avgIntervalMs,
  )

  for (let i = 1; i <= projectionSteps; i++) {
    const nextTimestamp = lastTimestamp + i * avgIntervalMs
    const projectedX = (nextTimestamp - startTime) / avgIntervalMs
    const projectedY = slope * projectedX + intercept

    projection.push({
      id: lastEntry.id + i,
      timestamp: new Date(nextTimestamp).toISOString(),
      yield: Math.max(0, projectedY),
      isProjected: true,
    })
  }

  return projection
}
