"use client"
import clsx from "clsx"
import * as React from "react"
import Icon, { type IconName } from "./Icon"

export type Type = "surface" | "success" | "warning" | "error" | "brand"
type Role = "Primary" | "Secondary"
type Size = "tiny" | "small" | "medium" | "large"

export type TagProps = {
  type: Type
  role: Role
  size: Size
  text: string
  leadingIcon?: IconName
  trailingIcon?: IconName
}

const Tag: React.FC<TagProps> = ({
  type,
  role,
  size,
  text,
  leadingIcon,
  trailingIcon,
}) => {
  const baseClasses = "inline-flex items-center rounded-button gap-8"

  const colorClasses: Record<Type, Record<Role, string>> = {
    surface: {
      Primary: clsx(
        "bg-surface-primary border-gradient border-color-secondary",
      ),
      Secondary: clsx(
        "bg-surface-secondary border-gradient border-color-secondary",
      ),
    },
    success: {
      Primary: clsx("bg-success-primary"),
      Secondary: clsx("bg-success-secondary"),
    },
    warning: {
      Primary: clsx("bg-warning-primary"),
      Secondary: clsx("bg-warning-secondary"),
    },
    error: {
      Primary: clsx("bg-error-primary"),
      Secondary: clsx("bg-error-secondary"),
    },
    brand: {
      Primary: clsx("bg-brand-primary border-gradient border-color-gradient"),
      Secondary: clsx(
        "bg-brand-secondary border-gradient border-color-gradient",
      ),
    },
  }

  const sizeClasses: Record<Size, string> = {
    tiny: "px-8 py-2 text-xxs",
    small: "px-10 py-4 text-xxs",
    medium: "px-8 py-4 text-sm",
    large: "px-12 py-4 text-md",
  }

  const iconSizes: Record<Size, number> = {
    tiny: 14,
    small: 14,
    medium: 16,
    large: 16,
  }

  const textClasses: Record<Type, Record<Role, string>> = {
    surface: {
      Primary: "text-primary",
      Secondary: "text-primary",
    },
    success: {
      Primary: "text-on-success-primary",
      Secondary: "text-on-success-secondary",
    },
    warning: {
      Primary: "text-on-warning-primary",
      Secondary: "text-on-warning-secondary",
    },
    error: {
      Primary: "text-on-error-primary",
      Secondary: "text-on-error-secondary",
    },
    brand: {
      Primary: "text-on-brand-primary",
      Secondary: "text-on-brand-secondary",
    },
  }

  const tagClasses = clsx(
    baseClasses,
    colorClasses[type][role],
    sizeClasses[size],
  )
  const textClass = clsx(textClasses[type][role])

  return (
    <div className={tagClasses}>
      {leadingIcon && <Icon name={leadingIcon} size={iconSizes[size]} />}
      <span className={textClass}>{text}</span>
      {trailingIcon && <Icon name={trailingIcon} size={iconSizes[size]} />}
    </div>
  )
}

export default Tag
