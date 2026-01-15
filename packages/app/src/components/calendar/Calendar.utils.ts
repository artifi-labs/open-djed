import type { DateRange, DayCell, TimeString } from "./Calendar.types"

export const isSameDay = (a: Date, b: Date): boolean =>
  normalizedDay(a).getTime() === normalizedDay(b).getTime()

export const applyTimeToDay = (day: Date, time: TimeString): Date => {
  const result = new Date(day)
  const [startHours, startMinutes] = time.split(":").map(Number)
  result.setHours(startHours, startMinutes, 0, 0)
  return result
}

export const segmentIntoWeeks = (date: Date): DayCell[][] => {
  const weeks: DayCell[][] = []
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const startIndex = (firstDay.getDay() + 6) % 7
  const days: DayCell[] = []

  const prevMonthLastDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    0,
  ).getDate()
  for (let i = 0; i < startIndex; i++) {
    days.push({
      date: new Date(
        date.getFullYear(),
        date.getMonth() - 1,
        prevMonthLastDay - startIndex + i + 1,
      ),
      enable: false,
    })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({
      date: new Date(date.getFullYear(), date.getMonth(), d),
      enable: true,
    })
  }

  const endIndex = (lastDay.getDay() + 6) % 7
  for (let i = 1; i <= 6 - endIndex; i++) {
    days.push({
      date: new Date(date.getFullYear(), date.getMonth() + 1, i),
      enable: false,
    })
  }

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return weeks
}

export const normalizedDay = (day: Date): Date =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate())

export const isInRange = (day: Date, range: DateRange) =>
  range.start &&
  day >= normalizedDay(range.start) &&
  (range.end ? day <= normalizedDay(range.end) : true)

export const isWithinRange = (day: number, start?: Date, end?: Date) => {
  const from = start ? normalizedDay(start).getTime() : Number.NEGATIVE_INFINITY
  const to = end ? normalizedDay(end).getTime() : Number.POSITIVE_INFINITY

  return day >= from && day <= to
}
