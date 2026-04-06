export const toISODate = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Formats an ISO date string into a short label like "01 Jan, 2024".
 *
 * @param value - The ISO date string to format
 * @returns The formatted label, or "Select" for empty/invalid dates
 */
export const formatDateLabel = (value?: string) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const day = `${date.getDate()}`.padStart(2, "0")
  const month = date.toLocaleString("en-US", { month: "short" })
  const year = date.getFullYear()
  return `${day} ${month}, ${year}`
}

export function formatRelativeDate(timestampMs: bigint): string {
  const date = new Date(Number(timestampMs))
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  // if date is less than 1 hour ago → "X min(s) ago"
  if (diffMinutes < 60) {
    if (diffMinutes <= 1) return "1 min ago"
    return `${diffMinutes} mins ago`
  }

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((nowDay.getTime() - dateDay.getTime()) / 86400000)

  // if date is today → "Today, 14:30"
  if (diffDays === 0) {
    return `Today, ${time}`
  }

  // if date was yesterday → "Yesterday, 21:30"
  if (diffDays === 1) {
    return `Yesterday, ${time}`
  }

  // if date is more than 48h ago → "12/02/2020"
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
