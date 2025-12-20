"use client"

import React from "react"
import clsx from "clsx"
import Divider from "./Divider"
import Icon, { type IconName } from "./Icon"
import Tag from "./Tag"
import ButtonIcon from "./ButtonIcon"
import Asset, { type AssetProps } from "./Asset"
import Button from "./Button"
import { sanitizeNumberInput } from "@/lib/utils"

type InputStatus = "default" | "warning" | "error" | "success"

export type TransactionInputProps = {
  leadingIcon?: IconName
  placeholder: string
  hasTag?: boolean
  tagLeadingIcon?: IconName
  tagTrailingIcon?: IconName
  suffix?: string
  asset?: AssetProps
  buttonIcon?: boolean
  trailingIcon?: IconName
  availableAmount?: string
  hasAvailableAmount?: boolean
  maxAmount?: string
  hasMaxAmount?: boolean
  status?: InputStatus
  disabled?: boolean
  hasMaxAndHalfActions?: boolean
  inputDisabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onAssetClick?: () => void
  onHalfClick?: () => void
  onMaxClick?: () => void
} & React.InputHTMLAttributes<HTMLInputElement>

const TransactionInput: React.FC<TransactionInputProps> = ({
  leadingIcon,
  placeholder,
  hasTag = false,
  tagLeadingIcon,
  tagTrailingIcon,
  suffix,
  asset,
  buttonIcon,
  trailingIcon,
  availableAmount,
  hasAvailableAmount = true,
  maxAmount,
  hasMaxAmount = false,
  status = "default",
  disabled = false,
  hasMaxAndHalfActions = true,
  inputDisabled = false,
  value,
  defaultValue = "",
  onValueChange,
  onAssetClick,
  onHalfClick,
  onMaxClick,
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const displayedValue = value !== undefined ? value : internalValue

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumberInput(e.target.value)
    if (sanitized === displayedValue) return
    if (value === undefined) setInternalValue(sanitized)
    onValueChange?.(sanitized)
  }

  const baseClasses =
    "border-gradient-b rounded-b-4 flex w-full flex-col gap-12 p-12 bg-surface-primary"

  const interactiveClasses =
    "hover:bg-surface-primary-hover focus:bg-surface-primary-focus active:bg-surface-primary-pressed"

  const disabledClasses =
    "cursor-not-allowed bg-disabled text-standalone-text-disabled border-color-disabled"

  const statusBorderClasses: Record<InputStatus, string> = {
    default: clsx(
      "border-color-custom [--border-custom-color:var(--color-border-primary)]",
      "border-color-gradient-hover border-color-gradient-active border-color-gradient-focus",
    ),
    warning:
      "border-color-custom [--border-custom-color:var(--color-warning-primary)]",
    error:
      "border-color-custom [--border-custom-color:var(--color-error-primary)]",
    success:
      "border-color-custom [--border-custom-color:var(--color-success-primary)]",
  }

  const inputClasses = clsx(
    "flex-1 min-w-0 w-full p-0 bg-transparent border-none outline-none",
    "placeholder:text-tertiary font-medium text-sm",
    disabled ? "text-standalone-text-disabled" : "text-primary",
  )
  const topRowClasses = clsx(
    "flex w-full items-center gap-10",
    disabled ? "text-standalone-text-disabled" : "text-tertiary",
  )

  const containerClasses = clsx(
    baseClasses,
    disabled
      ? disabledClasses
      : clsx(interactiveClasses, statusBorderClasses[status]),
  )

  return (
    <div className={containerClasses} aria-disabled={disabled}>
      <div className={topRowClasses}>
        {/* Leading Icon */}
        {leadingIcon && <Icon name={leadingIcon} />}

        {/* Input */}
        <input
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled || inputDisabled}
          value={displayedValue}
          onChange={handleOnChange}
          {...props}
        />

        {/* Tag */}
        {hasTag && (
          <Tag
            type="surface"
            role="Primary"
            size="small"
            text="Tag"
            leadingIcon={tagLeadingIcon}
            trailingIcon={tagTrailingIcon}
          />
        )}

        {/* Suffix */}
        {suffix && <span className="text-xxs">{suffix}</span>}

        {/* Asset */}
        {asset && <Asset {...asset} />}

        {/* Button Icon */}
        {buttonIcon && (
          <ButtonIcon
            variant="onlyIcon"
            size="tiny"
            icon="Placeholder"
            disabled={disabled}
          />
        )}

        {/* Trailing Icon */}
        {trailingIcon && <Icon name={trailingIcon} />}
      </div>

      <div className="text-primary flex w-full items-center justify-between text-xs">
        {hasMaxAndHalfActions && availableAmount && (
          <div className="flex gap-8">
            {/* Half */}
            <Button
              text="Half"
              variant="text"
              size="small"
              disabled={disabled}
              className={clsx(
                "cursor-pointer",
                disabled
                  ? "text-standalone-text-disabled"
                  : "hover:text-nocolor-text-hover",
              )}
              onClick={onHalfClick}
            />

            {/* Divider */}
            <Divider orientation="vertical" />

            {/* Max */}
            <Button
              text="Max"
              variant="text"
              size="small"
              disabled={disabled}
              className={clsx(
                "cursor-pointer",
                disabled
                  ? "text-standalone-text-disabled"
                  : "hover:text-nocolor-text-hover",
              )}
              onClick={onMaxClick}
            />
          </div>
        )}

        {/* Available Amount */}
        {hasAvailableAmount && availableAmount && (
          <span
            className={clsx(
              "text-xxs flex flex-row items-center justify-center gap-1 pr-8 leading-none",
              disabled ? "text-standalone-text-disabled" : "text-tertiary",
            )}
          >
            Available: {availableAmount}
          </span>
        )}

        {/* Max Amount */}
        {hasMaxAmount && maxAmount && (
          <span
            className={clsx(
              "text-xxs flex flex-row items-center justify-center gap-1 pr-8 leading-none",
              disabled ? "text-standalone-text-disabled" : "text-tertiary",
            )}
          >
            Max: {maxAmount}
          </span>
        )}
      </div>
    </div>
  )
}

export default TransactionInput
