"use client"
import * as React from "react"
import clsx from "clsx"
import Icon, { type IconName } from "./icons/Icon"

export type Variant =
  | "primary"
  | "secondary"
  | "outlined"
  | "accent"
  | "destructive"
  | "onlyIcon"

export type Size = "tiny" | "small" | "medium" | "large"

type BaseButtonIconProps = {
  id?: string
  name?: string
  variant?: Variant
  size?: Size
  disabled?: boolean
  icon: IconName
  iconColor?: string
  active?: boolean
  className?: string
  hasButton?: boolean
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const ButtonIcon: React.FC<BaseButtonIconProps> = ({
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick,
  icon,
  iconColor,
  className,
  active,
  hasButton = true,
  ...rest
}) => {
  const baseClasses = clsx(
    "inline-flex items-center justify-center",
    "rounded-button transition focus:outline-none",
    disabled ? "cursor-not-allowed" : "cursor-pointer",
  )

  const disabledClasses = clsx(
    "bg-disabled border-gradient border-color-disabled-disabled",
  )

  const variantClasses: Record<
    Variant,
    { active: string; className: string; disabled: string }
  > = {
    primary: {
      active: "bg-brand-primary-pressed",
      className:
        "bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-pressed",
      disabled: disabledClasses,
    },
    secondary: {
      active: "bg-brand-secondary-pressed",
      className:
        "bg-brand-secondary hover:bg-brand-secondary-hover active:bg-brand-secondary-pressed",
      disabled: disabledClasses,
    },
    outlined: {
      active: "bg-no-color-pressed",
      className: clsx(
        "bg-transparent border-gradient border-color-gradient",
        "hover:bg-no-color-hover active:bg-no-color-pressed",
      ),
      disabled: disabledClasses,
    },
    accent: {
      active: "bg-gradient-angular-1",
      className:
        "bg-gradient-angular-2 hover:bg-gradient-angular-1 active:bg-gradient-angular-1",
      disabled: disabledClasses,
    },
    destructive: {
      active: "bg-error-primary-pressed",
      className:
        "bg-error-primary hover:bg-error-primary-hover active:bg-error-primary-pressed",
      disabled: disabledClasses,
    },
    onlyIcon: {
      active: "bg-no-color-pressed",
      className:
        "bg-transparent hover:bg-no-color-hover active:bg-no-color-pressed",
      disabled: "",
    },
  }

  const sizeClasses: Record<Size, string> = {
    tiny: "p-6",
    small: "p-8",
    medium: "p-10",
    large: "p-16",
  }

  const iconSize: Record<Size, number> = {
    tiny: 14,
    small: 14,
    medium: 22,
    large: 24,
  }

  const classes = clsx(
    baseClasses,
    !disabled && variantClasses[variant].className,
    !disabled && active && variantClasses[variant].active,
    disabled && variantClasses[variant].disabled,
    sizeClasses[size],
    className,
  )

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return
    onClick?.(e)
  }

  if (hasButton) {
    return (
      <button
        type="button"
        className={classes}
        disabled={disabled}
        onClick={handleClick}
        {...rest}
      >
        <Icon
          name={icon}
          size={iconSize[size]}
          iconColor={disabled ? "text-standalone-text-disabled" : iconColor}
        />
      </button>
    )
  }

  return (
    <div className={classes}>
      <Icon
        name={icon}
        size={iconSize[size]}
        iconColor={disabled ? "text-standalone-text-disabled" : iconColor}
      />
    </div>
  )
}

export default ButtonIcon
