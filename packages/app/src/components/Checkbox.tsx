import * as React from "react"
import clsx from "clsx"
import Icon, { type IconName } from "./Icon"

export type CheckboxType = "Deselected" | "Selected" | "Indeterminate"

export type CheckboxProps = {
  disabled?: boolean
  defaultType?: CheckboxType
  size?: number
  order?: CheckboxType[]
  onStateChange?: (newState: CheckboxType) => void
} & React.HTMLAttributes<HTMLDivElement>

/** Default order of checkbox states */
const DEFAULT_CHECKBOX_ORDER: CheckboxType[] = [
  "Deselected",
  "Indeterminate",
  "Selected",
]

/**
 * Get the next state in the order array.
 *
 * @param current - Current checkbox state
 * @param order - Array of states defining the toggle order
 * @returns The next CheckboxType in the cycle
 */
const getNextType = (
  current: CheckboxType,
  order: CheckboxType[],
): CheckboxType => {
  const index = order.indexOf(current)
  const safeIndex = index === -1 ? 0 : index
  return order[(safeIndex + 1) % order.length]
}

/** Map of icons for each checkbox state */
const ICON_BY_TYPE: Record<CheckboxType, IconName | null> = {
  Deselected: null,
  Selected: "Checkmark",
  Indeterminate: "Minus",
}

const Checkbox: React.FC<CheckboxProps> = ({
  disabled = false,
  defaultType = "Deselected",
  size = 24,
  order = DEFAULT_CHECKBOX_ORDER,
  onStateChange,
  ...props
}) => {
  const safeOrder = order.length > 0 ? order : DEFAULT_CHECKBOX_ORDER
  const [currentType, setCurrentType] = React.useState<CheckboxType>(
    safeOrder.includes(defaultType) ? defaultType : safeOrder[0],
  )
  const isSelected = currentType === "Selected"
  const isIndeterminate = currentType === "Indeterminate"

  /* Update currentType if defaultType changes */
  React.useEffect(() => {
    setCurrentType((prev) => {
      // Only update if the new defaultType is different and valid
      if (prev !== defaultType && safeOrder.includes(defaultType)) {
        return defaultType
      }
      return prev
    })
  }, [defaultType, safeOrder])

  const handleToggle = () => {
    if (disabled) return
    const next = getNextType(currentType, safeOrder)
    setCurrentType(next)
    onStateChange?.(next)
  }

  const baseClasses =
    "flex items-center justify-center rounded-4 border select-none transition-colors duration-150 text-primary"

  const disabledDefaultStateClasses =
    "cursor-not-allowed bg-disabled border-border-disabled text-transparent"

  const disabledClasses =
    "cursor-not-allowed bg-disabled border-disabled text-on-disabled"

  const defaultStateClasses =
    "cursor-pointer bg-background-primary border-border-secondary text-transparent hover:bg-background-primary-hover hover:border-border-secondary-hover"

  const selectedOrIndeterminateClasses =
    "cursor-pointer bg-brand-primary border-brand-primary text-on-brand-primary hover:bg-brand-primary-hover hover:border-brand-primary-hover"

  const stateClasses = disabled
    ? isSelected || isIndeterminate
      ? disabledClasses
      : disabledDefaultStateClasses
    : isSelected || isIndeterminate
      ? selectedOrIndeterminateClasses
      : defaultStateClasses

  const checkboxClasses = clsx(baseClasses, stateClasses)

  return (
    <div
      role="checkbox"
      aria-checked={isIndeterminate ? "mixed" : isSelected}
      aria-disabled={disabled}
      onClick={handleToggle}
      style={{ width: size, height: size }}
      className={checkboxClasses}
      {...props}
    >
      {ICON_BY_TYPE[currentType] && (
        <Icon
          name={ICON_BY_TYPE[currentType]}
          size={size}
          className={disabled ? "text-on-disabled" : "text-on-brand-primary"}
        />
      )}
    </div>
  )
}

export default Checkbox
