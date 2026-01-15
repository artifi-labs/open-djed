import type { ContextualMenuItem } from "../ContextualMenu"

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const shortWeekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export const periodItems: ContextualMenuItem[] = [
  { key: "today", text: "Today" },
  { key: "thisWeek", text: "This week" },
  { key: "thisMonth", text: "This month" },
  { key: "thisQuarter", text: "This quarter" },
  { key: "thisYear", text: "This year" },
  { key: "lastWeek", text: "Last week" },
  { key: "lastMonth", text: "Last month" },
]
