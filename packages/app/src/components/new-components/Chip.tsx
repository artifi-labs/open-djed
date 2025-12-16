"use client"
import clsx from "clsx"
import React from "react"
import Icon, { type IconName } from "./Icon"

type Variant = "filled" | "outlined"

type Size = "small" | "medium" | "large"

export type ChipProps = {
  leadingIcon?: IconName
  trailingIcon?: IconName
  text: string
  size?: Size
  variant?: Variant
  disabled?: boolean
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const Chip: React.FC<ChipProps> = ({
  leadingIcon,
  trailingIcon,
  text,
  size = "small",
  variant = "filled",
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClasses: string =
    "inline-flex cursor-pointer rounded-full gap-8 justify-center items-center text-secondary border-gradient"

  const disabledClasses: string =
    "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled border-color-disabled-disabled"

  const variantClasses: Record<Variant, string> = {
    filled:
      "border-color-secondary bg-surface-primary hover:bg-surface-primary-hover hover:text-primary active:bg-brand-primary active:text-on-brand-primary",
    outlined:
      "border-color-secondary border-color-gradient-active bg-transparent hover:bg-no-color-hover hover:text-primary active:text-primary active:bg-no-color-pressed",
  }

  const sizeClasses: Record<Size, string> = {
    large: "px-16 py-10 text-md",
    medium: "px-16 py-8 text-sm",
    small: "px-14 py-6 text-sm",
  }

  const iconSize: Record<Size, number> = { small: 16, medium: 22, large: 24 }

  const buttonClasses: string = clsx(
    baseClasses,
    sizeClasses[size],
    !disabled && variantClasses[variant],
    disabledClasses,
    className,
  )

  return (
    <button className={buttonClasses} disabled={disabled} {...props}>
      {leadingIcon && <Icon name={leadingIcon} size={iconSize[size]} />}
      <span>{text}</span>
      {trailingIcon && <Icon name={trailingIcon} size={iconSize[size]} />}
    </button>
  )
}

export default Chip
