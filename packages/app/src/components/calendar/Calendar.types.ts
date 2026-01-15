import type { ContextualMenuItem } from "../ContextualMenu"

type BaseCalendarProps = {
  defaultDay?: Date
  defaultSelectedDays?: DateRange
  disabledDates?: DateRange[]
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

export type DayCell = {
  date: Date
  enable: boolean
}

export type DateRange = {
  start?: Date
  end?: Date
}

export type TimeString = `${number}${number}:${number}${number}`

export type ShortcutProps = {
  itemKey: string | number
  text: string
  active?: boolean
  onClick: (item: { key: string | number; text: string }) => void
}

export type ShortcutsProps = {
  items: ContextualMenuItem[]
  onClick: (item: ContextualMenuItem) => void
  activeKey?: string | number
}

export type NumberInputProps = {
  text: number
  active?: boolean
  currentDate: boolean
  canMultipleSelect?: boolean
  disabled?: boolean
  onClick: () => void
  isFocused?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}
