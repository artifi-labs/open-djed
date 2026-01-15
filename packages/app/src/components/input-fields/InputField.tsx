"use client"

import {
  useState,
  type ButtonHTMLAttributes,
  type FC,
  type InputHTMLAttributes,
} from "react"
import clsx from "clsx"
import type { IconName } from "../icons/Icon"
import Icon from "../icons/Icon"
import { sanitizeNumberInput } from "@/lib/utils"

type Size = "Small" | "Medium" | "Large"

export type BaseInputFieldProps = {
  placeholder?: string
  size: Size
  iconSize?: number
  leadingIcon?: IconName
  trailingIcon?: IconName
  maxValue?: number
  maxDecimalPlaces?: number
  onValueChange?: (value: string) => void
  inputClassName?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">

type AtLeastOneIdOrName =
  | { id: string; name?: string }
  | { name: string; id?: string }

export type InputFieldProps = BaseInputFieldProps & AtLeastOneIdOrName

type CloseButtonProps = {
  onClick: () => void
  size: number
} & ButtonHTMLAttributes<HTMLButtonElement>

const ClearButton: FC<CloseButtonProps> = ({ onClick, size, ...props }) => {
  const className = clsx("cursor-pointer p-8", props.className)

  return (
    <button onClick={onClick} className={className} {...props}>
      <Icon name="Close" size={size} />
    </button>
  )
}

const InputField: FC<InputFieldProps> = ({
  placeholder,
  size,
  leadingIcon,
  trailingIcon,
  iconSize = 22,
  value,
  defaultValue = "",
  maxValue,
  maxDecimalPlaces,
  onValueChange,
  inputClassName,
  autoComplete = "on",
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [isTyping, setIsTyping] = useState(false)
  const displayedValue = value !== undefined ? value : internalValue
  const inputValue = displayedValue === "0" ? "" : displayedValue

  const sizeClasses: Record<Size, { text: string; className: string }> = {
    Small: { text: "text-sm", className: "px-10 py-8 h-[40px]" },
    Medium: { text: "text-sm", className: "px-10 py-12 h-[44px]" },
    Large: { text: "text-md", className: "px-12 py-16 h-[46px]" },
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumberInput(e.target.value)

    if (maxDecimalPlaces !== undefined && sanitized !== "") {
      const parts = sanitized.split(".")
      if (parts.length > 1 && parts[1].length > maxDecimalPlaces) {
        return
      }
    }

    if (maxValue !== undefined && sanitized !== "") {
      const numValue = parseFloat(sanitized)
      if (!isNaN(numValue) && numValue > maxValue) {
        return
      }
    }

    if (sanitized === displayedValue) return
    if (value === undefined) setInternalValue(sanitized)
    onValueChange?.(sanitized)
  }

  const baseClasses = clsx(
    "w-full",
    "border-gradient border-color-primary bg-surface-primary rounded-input-dropdown items-center flex flex-row gap-8",
    sizeClasses[size].className,
  )

  const interactiveClasses = clsx(
    "hover:bg-surface-primary-hover focus-within:bg-surface-primary-focused active:bg-surface-primary-pressed",
    "border-color-gradient-hover border-color-gradient-focus active:border-color-gradient",
  )

  const textClassName = clsx(
    "text-primary placeholder:text-tertiary font-medium outline-none",
    "flex-1",
    sizeClasses[size].text,
    inputClassName,
  )

  return (
    <div className={clsx(baseClasses, interactiveClasses)}>
      {leadingIcon && <Icon name={leadingIcon} size={iconSize} />}
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        className={textClassName}
        onChange={handleOnChange}
        onFocus={() => setIsTyping(true)}
        onBlur={() => setIsTyping(false)}
        value={inputValue}
        autoComplete={autoComplete}
        {...props}
        autoComplete="off"
      />

      {/* Clear Input Button */}
      {(isTyping || value) && (
        <ClearButton
          onClick={() => {
            if (value === undefined) setInternalValue("")
            onValueChange?.("")
          }}
          size={14}
          id={`${props.id}-clear-button`}
          name={`${props.name}-clear-button`}
          aria-label={`Clear ${placeholder || "input"}`}
          onMouseDown={(e) => e.preventDefault()}
        />
      )}

      {trailingIcon && <Icon name={trailingIcon} size={iconSize} />}
    </div>
  )
}

export default InputField
