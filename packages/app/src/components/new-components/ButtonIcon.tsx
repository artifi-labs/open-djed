"use client"
import * as React from "react"
import clsx from "clsx"
import Icon, { type IconName } from "./Icon"

export type Variant =
  | "primary"
  | "secondary"
  | "outlined"
  | "accent"
  | "destructive"
  | "onlyIcon"

export type Size = "tiny" | "small" | "medium" | "large"

export type ButtonIconProps = {
  variant?: Variant
  size?: Size
  disabled?: boolean
  icon: IconName
  iconColor?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  active?: boolean
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const ButtonIcon: React.FC<ButtonIconProps> = ({
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick,
  icon,
  iconColor,
  className,
  active,
  ...props
}) => {
  const disabledClasses = "disabled:cursor-not-allowed disabled:bg-disabled"

  const baseClasses = clsx(
    "inline-flex items-center justify-center gap-2",
    "rounded-button text-white transition focus:outline-none focus:ring-none cursor-pointer",
    disabledClasses,
  )

  const variantClasses: Record<Variant, { active: string; className: string }> =
    {
      primary: {
        active: "bg-brand-primary-pressed",
        className: clsx(
          "bg-brand-primary border-gradient border-color-gradient border-color-disabled-disabled hover:bg-brand-primary-hover focus:bg-brand-primary-focused active:bg-brand-primary-pressed",
        ),
      },
      secondary: {
        active: "bg-brand-secondary-pressed",
        className: clsx(
          "bg-brand-secondary border-gradient border-color-gradient border-color-disabled-disabled hover:bg-brand-secondary-hover focus:bg-brand-secondary-focused active:bg-brand-secondary-pressed",
        ),
      },
      outlined: {
        active: "bg-no-color-pressed",
        className: clsx(
          "bg-transparent border-gradient border-color-gradient border-color-disabled-disabled hover:bg-no-color-hover focus:bg-no-color-focused active:bg-no-color-pressed",
        ),
      },
      accent: {
        active: "bg-gradient-angular-1",
        className: clsx(
          disabled && "border-gradient border-color-disabled-disabled",
          !disabled &&
            "bg-gradient-angular-2 hover:bg-gradient-angular-1 focus:bg-gradient-angular-1 active:bg-gradient-angular-1",
        ),
      },
      destructive: {
        active: "bg-error-primary-pressed",
        className: clsx(
          "bg-error-primary hover:bg-error-primary-hover focus:bg-error-primary-focused active:bg-error-primary-pressed",
        ),
      },
      onlyIcon: {
        active: "bg-no-color-pressed",
        className: clsx(
          "bg-transparent hover:bg-no-color-hover focus:bg-no-color-focused active:bg-no-color-pressed disabled:bg-transparent",
        ),
      },
    }

  const sizeClasses: Record<Size, string> = {
    tiny: "p-6",
    small: "p-8",
    medium: "p-10",
    large: "p-16",
  }

  const IconSize: Record<Size, number> = {
    tiny: 14,
    small: 14,
    medium: 22,
    large: 24,
  }

  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    active && variantClasses[variant].active,
    className,
  )

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!disabled && onClick) {
      onClick(e)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      <Icon name={icon} size={IconSize[size]} color={iconColor} />
    </button>
  )
}

export default ButtonIcon
