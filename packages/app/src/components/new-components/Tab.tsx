"use client"
import React from "react"
import clsx from "clsx"
import Icon, { type IconName } from "./Icon"
import Coin, { type IconCoinName } from "./Coin"

export type Variant = "primary" | "secondary" | "outlined"
type Size = "small" | "medium" | "large"
export type Radius = "4" | "full"

export type TabProps = {
  variant: Variant
  size: Size
  coin?: IconCoinName
  text: string
  leadingIcon?: IconName
  trailingIcon?: IconName
  disabled?: boolean
  className?: string
  radius: Radius
  active?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const Tab: React.FC<TabProps> = ({
  variant = "primary",
  coin,
  text,
  size = "small",
  leadingIcon,
  trailingIcon,
  disabled = false,
  radius,
  className = "",
  active = false,
  ...props
}) => {
  const baseClasses =
    "tab inline-flex cursor-pointer gap-8 justify-center items-center text-on-brand-primary border-gradient"

  const disabledClasses =
    "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled border-color-disabled-disabled"

  const radiusClasses: Record<Radius, string> = {
    "4": "rounded-4",
    full: "rounded-button",
  }

  const variantClasses: Record<Variant, { className: string; active: string }> =
    {
      primary: {
        className:
          "bg-surface-primary hover:bg-surface-primary-hover focus:bg-surface-primary-focused active:bg-brand-primary",
        active: "bg-brand-primary",
      },
      secondary: {
        className:
          "text-primary bg-surface-secondary hover:bg-surface-secondary-hover active:bg-brand-primary active:text-on-brand-primary focus:bg-surface-secondary-focused",
        active: "bg-brand-primary text-on-brand-primary ",
      },
      outlined: {
        className: clsx(
          "border-color-secondary border-color-gradient-hover border-color-gradient-active border-color-gradient-active border-color-disabled-disabled",
          "bg-transparent text-primary active:text-on-brand-primary active:bg-brand-primary",
        ),
        active: "text-on-brand-primary bg-brand-primary",
      },
    }

  const sizeClasses: Record<Size, string> = {
    large: "px-24 py-16 text-md",
    medium: "px-18 py-12 text-sm",
    small: "px-14 py-8 text-xs",
  }

  const iconSize: Record<Size, number> = {
    small: 16,
    medium: 22,
    large: 24,
  }

  const buttonClasses = clsx(
    baseClasses,
    sizeClasses[size],
    radiusClasses[radius],
    !disabled && variantClasses[variant],
    active && variantClasses[variant].active,
    disabledClasses,
    className,
  )

  return (
    <button className={buttonClasses} disabled={disabled} {...props}>
      {leadingIcon && <Icon name={leadingIcon} size={iconSize[size]} />}
      {coin && <Coin name={coin} size={size} />}
      <span>{text}</span>
      {trailingIcon && <Icon name={trailingIcon} size={iconSize[size]} />}
    </button>
  )
}

export default Tab
