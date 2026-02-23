// TODO: ADD TESTS
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) {
    return sorted[mid] ?? 0
  }
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
}