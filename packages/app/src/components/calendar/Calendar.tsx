"use client"

import clsx from "clsx"
import * as React from "react"
import ButtonIcon from "../ButtonIcon"
import Divider from "../Divider"
import InputField from "../input-fields/InputField"
import { useState, useCallback } from "react"
import DropdownCalendar from "./DropdownCalendar"
import type { ContextualMenuItem } from "../ContextualMenu"
import { capitalizeLower } from "../../lib/utils"

type BaseCalendarProps = {
  defaultDay?: Date
  defaultSelectedDays?: DateRange
  draftMode?: boolean
  defaultStartTime?: string
  defaultEndTime?: string
  minYear?: number
  maxYear?: number
  hasTimeSelection?: boolean
  hasPeriodSelection?: boolean
  canMultipleSelect?: boolean
  className?: string
  onChange?: (value: CalendarValue) => void
}

type SingleSelectCalendarProps = BaseCalendarProps & {
  canMultipleSelect?: false
  draftMode?: never
  hasPeriodSelection?: never
}

type MultiSelectCalendarProps = BaseCalendarProps & {
  canMultipleSelect: true
  draftMode: true
  hasPeriodSelection?: boolean
}

export type CalendarProps = MultiSelectCalendarProps | SingleSelectCalendarProps

export type CalendarValue = {
  range: {
    start?: Date
    end?: Date
  }
}

type DayCell = {
  date: Date
  enable: boolean
}

type DateRange = {
  start?: Date
  end?: Date
}

type TimeString = `${number}${number}:${number}${number}`

type ShortcutProps = {
  itemKey: string | number
  text: string
  active?: boolean
  onClick: (item: { key: string | number; text: string }) => void
}

type ShortcutsProps = {
  items: ContextualMenuItem[]
  onClick: (item: ContextualMenuItem) => void
  activeKey?: string | number
}

type NumberInputProps = {
  text: number
  active?: boolean
  currentDate: boolean
  canMultipleSelect?: boolean
  onClick: () => void
  isFocused?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

// Constants
const months = [
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

const shortWeekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const periodItems: ContextualMenuItem[] = [
  { key: "today", text: "Today" },
  { key: "thisWeek", text: "This week" },
  { key: "thisMonth", text: "This month" },
  { key: "thisQuarter", text: "This quarter" },
  { key: "thisYear", text: "This year" },
  { key: "lastWeek", text: "Last week" },
  { key: "lastMonth", text: "Last month" },
]

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const applyTimeToDay = (day: Date, time: TimeString): Date => {
  const result = new Date(day)
  const [startHours, startMinutes] = time.split(":").map(Number)
  result.setHours(startHours, startMinutes, 0, 0)
  return result
}

const segmentIntoWeeks = (date: Date): DayCell[][] => {
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

const normalizedDay = (day: Date): Date =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate())

const isInRange = (day: Date, range: DateRange) =>
  range.start &&
  day >= normalizedDay(range.start) &&
  (range.end ? day <= normalizedDay(range.end) : true)

const Shortcut: React.FC<ShortcutProps> = ({
  itemKey,
  text,
  active = false,
  onClick,
}) => {
  const shortcutClassName = clsx(
    "flex py-10 px-12 text-primary text-sm rounded-4",
    active && "bg-brand-primary",
    "hover:bg-brand-primary-hover active:bg-brand-primary",
    "text-nowrap",
  )

  return (
    <button
      id={`calendar-shortcut-${itemKey}`}
      className={shortcutClassName}
      onClick={() => onClick({ key: itemKey, text })}
    >
      <span>{text}</span>
    </button>
  )
}

const Shortcuts: React.FC<ShortcutsProps> = ({ items, onClick, activeKey }) => {
  return (
    <div className="desktop:flex-col max-desktop:overflow-x-auto flex flex-row gap-4">
      {items.map((item) => (
        <Shortcut
          key={item.key}
          itemKey={item.key}
          text={item.text}
          active={activeKey === item.key}
          onClick={(selectedItem) => onClick(selectedItem)}
        />
      ))}
    </div>
  )
}

const NumberInput: React.FC<NumberInputProps> = ({
  text,
  active = false,
  currentDate,
  onClick,
  isFocused = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  const numberInputClassName = clsx(
    "p-10 rounded-4",
    active && "bg-brand-primary",
    isFocused && "bg-no-color-focused",
    currentDate && "text-secondary",
    !currentDate && "text-standalone-text-disabled",
    "hover:bg-brand-primary-hover active:bg-brand-primary",
    "text-sm text-center cursor-pointer select-none",
  )

  return (
    <div
      className={numberInputClassName}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span>{text}</span>
    </div>
  )
}

const Calendar: React.FC<CalendarProps> = ({
  defaultDay,
  defaultSelectedDays,
  draftMode = false,
  hasTimeSelection = true,
  defaultStartTime = "00:00",
  defaultEndTime = "23:59",
  hasPeriodSelection = true,
  canMultipleSelect = true,
  minYear = new Date().getFullYear() - 100,
  maxYear = new Date().getFullYear() + 100,
  onChange,
}) => {
  const [range, setRange] = useState<DateRange>(() => ({
    start: defaultSelectedDays?.start
      ? normalizedDay(defaultSelectedDays.start)
      : undefined,
    end: defaultSelectedDays?.end
      ? normalizedDay(defaultSelectedDays.end)
      : undefined,
  }))

  const [currentDate, setCurrentDate] = useState(
    defaultSelectedDays?.start ?? defaultDay ?? new Date(),
  )
  const [startTime, setStartTime] = useState<TimeString>(
    defaultStartTime as TimeString,
  )
  const [endTime, setEndTime] = useState<TimeString>(
    defaultEndTime as TimeString,
  )
  const [activePeriod, setActivePeriod] = useState<string>()
  const [draftDay, setDraftDay] = useState<Date | null>(null)

  const weeks = React.useMemo(
    () => segmentIntoWeeks(currentDate),
    [currentDate],
  )
  const resolvedHasPeriodSelection = canMultipleSelect && hasPeriodSelection

  const emitRange = useCallback(
    (r: DateRange) => {
      if (!r.start) return
      onChange?.({
        range: {
          start: applyTimeToDay(r.start, startTime),
          end: r.end ? applyTimeToDay(r.end, endTime) : undefined,
        },
      })
    },
    [onChange, startTime, endTime],
  )

  React.useEffect(() => {
    emitRange(range)
  }, [range, startTime, endTime, emitRange])

  const handleSelectDay = (day: Date) => {
    const d = normalizedDay(day)
    setRange((prev) => {
      if (!prev.start || !canMultipleSelect || prev.end) return { start: d }
      return d < prev.start
        ? { start: d, end: prev.start }
        : { start: prev.start, end: d }
    })
  }

  const changeMonth = (delta: number) => {
    const next = new Date(currentDate)
    next.setMonth(currentDate.getMonth() + delta)
    if (next.getFullYear() < minYear || next.getFullYear() > maxYear) return
    setCurrentDate(next)
  }

  const handleMonthChange = (item: ContextualMenuItem) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(Number(item.key))
    setCurrentDate(newDate)
  }

  const handleYearChange = (item: ContextualMenuItem) => {
    const selectedYear = Number(item.text)
    if (minYear && selectedYear < minYear) return
    if (maxYear && selectedYear > maxYear) return
    const newDate = new Date(currentDate)
    newDate.setFullYear(selectedYear)
    setCurrentDate(newDate)
  }

  const handlePeriodClick = (item: ContextualMenuItem) => {
    setActivePeriod(String(item.key))
    const now = new Date()
    let start!: Date, end!: Date
    switch (item.key) {
      case "today":
        start = end = now
        break
      case "thisWeek": {
        const d = (now.getDay() + 6) % 7
        start = new Date(now)
        start.setDate(now.getDate() - d)
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        break
      }
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case "thisQuarter": {
        const q = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), q * 3, 1)
        end = new Date(now.getFullYear(), q * 3 + 3, 0)
        break
      }
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31)
        break
      case "lastWeek": {
        const e = new Date(now)
        e.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 1)
        start = new Date(e)
        start.setDate(e.getDate() - 6)
        end = e
        break
      }
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      default:
        return
    }
    setRange({ start: normalizedDay(start), end: normalizedDay(end) })
    setCurrentDate(normalizedDay(start))
  }

  const handleTimeChange = (time: TimeString, isStart: boolean) => {
    if (isStart) setStartTime(time)
    else setEndTime(time)
  }

  const yearItems: ContextualMenuItem[] = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => {
      const year = minYear + i
      return {
        key: year,
        text: year.toString(),
        icon: currentDate.getFullYear() === year ? "Checkmark" : undefined,
      }
    },
  )
  const timeInputClassName = "text-tertiary"
  const calendarClassName = clsx(
    "p-12 flex flex-col gap-16 radius-4 border-primary bg-surface-tertiary",
    "text-primary",
    "max-w-[343px] desktop:max-w-[480px]",
  )
  const calendarStyle: React.CSSProperties = {
    boxShadow:
      "0 4px var(--spacing-blur-12, 12px) var(--spacing-blur-8, 8px) rgba(0, 55, 128, 0.12)",
  }

  return (
    <div className={calendarClassName} style={calendarStyle}>
      <div className="flex flex-row items-center justify-between self-stretch">
        <ButtonIcon
          icon="Chevron-left"
          size="small"
          variant="onlyIcon"
          onClick={() => changeMonth(-1)}
        />
        <div className="flex items-center gap-8">
          <DropdownCalendar
            text={capitalizeLower(months[currentDate.getMonth()])}
            activeItem={{
              key: currentDate.getMonth(),
              text: capitalizeLower(months[currentDate.getMonth()]),
            }}
            menuItems={months.map((month, index) => ({
              key: index,
              text: capitalizeLower(month),
              icon: currentDate.getMonth() === index ? "Checkmark" : undefined,
            }))}
            leadingIcon="Chevron-down"
            onChange={handleMonthChange}
            menuWidth="w-[200px]"
          />
          <DropdownCalendar
            text={currentDate.getFullYear().toString()}
            activeItem={{
              key: currentDate.getFullYear(),
              text: currentDate.getFullYear().toString(),
            }}
            menuItems={yearItems}
            leadingIcon="Chevron-down"
            onChange={handleYearChange}
            menuWidth="w-[99px]"
          />
        </div>
        <ButtonIcon
          icon="Chevron-right"
          size="small"
          variant="onlyIcon"
          onClick={() => changeMonth(1)}
        />
      </div>

      <div className="desktop:flex-row flex flex-col gap-12">
        {resolvedHasPeriodSelection && (
          <>
            <Shortcuts
              items={periodItems}
              activeKey={activePeriod}
              onClick={handlePeriodClick}
            />
            <Divider orientation="vertical" className="desktop:block hidden" />
            <Divider
              orientation="horizontal"
              className="desktop:hidden block"
            />
          </>
        )}

        <div
          className="grid h-full w-full grid-cols-7 gap-y-8"
          style={{ gridTemplateRows: "auto repeat(5, 1fr)" }}
        >
          {shortWeekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium">
              {d}
            </div>
          ))}

          {weeks.flat().map(({ date, enable }, i) => {
            const active =
              (range.start && isSameDay(date, range.start)) ||
              (range.end && isSameDay(date, range.end))

            const between =
              range.start && range.end && isInRange(date, range) && !active

            const draftActive =
              !range.end &&
              draftMode &&
              range.start &&
              draftDay &&
              !active &&
              ((date >= range.start && date <= draftDay) ||
                (date <= range.start && date >= draftDay))

            return (
              <NumberInput
                key={i}
                text={date.getDate()}
                currentDate={enable}
                active={active}
                isFocused={!!between || !!draftActive}
                onClick={() => handleSelectDay(date)}
                onMouseEnter={() => draftMode && setDraftDay(date)}
              />
            )
          })}
        </div>
      </div>

      {hasTimeSelection && (
        <>
          <Divider orientation="horizontal" />
          <div className="flex flex-row py-8">
            <InputField
              id="time-start-select"
              placeholder={startTime}
              type="time"
              size="Small"
              width="w-full"
              onChange={(e) =>
                handleTimeChange(e.target.value as TimeString, true)
              }
              inputClassName={timeInputClassName}
            />
            <span className="flex min-w-18 items-center justify-center text-sm">
              :
            </span>
            <InputField
              id="time-end-select"
              type="time"
              placeholder={endTime}
              size="Small"
              width="w-full"
              onChange={(e) =>
                handleTimeChange(e.target.value as TimeString, false)
              }
              inputClassName={timeInputClassName}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Calendar
