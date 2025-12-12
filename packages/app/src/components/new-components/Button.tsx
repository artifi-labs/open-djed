"use client"

import * as React from "react"
import clsx from "clsx"
import Icon, { type IconName } from "./Icon"

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outlined"
  | "accent"
  | "text"
  | "destructive"
type ButtonSize = "small" | "medium" | "large"

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  wallet?: React.ReactNode
  trailingIcon?: IconName
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  leadingIcon?: IconName
  text: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const Button: React.FC<ButtonProps> = ({
  text,
  variant = "primary",
  size = "medium",
  disabled = false,
  wallet,
  leadingIcon,
  trailingIcon,
  onClick,
  className,
  ...props
}) => {
  const disabledClasses = "disabled:cursor-not-allowed"

  const baseClasses = clsx(
    "inline-flex items-center justify-center gap-8 rounded-full focus:outline-none focus:ring-none cursor-pointer",
    "font-medium",
    disabledClasses,
  )

  const variantClasses: Record<ButtonVariant, string> = {
    primary: clsx(
      "bg-brand-primary border-gradient border-color-gradient border-color-disabled-disabled hover:bg-brand-primary-hover focus:bg-brand-primary-focused active:bg-brand-primary-pressed",
      "text-on-brand-primary",
      "disabled:bg-disabled disabled:text-on-disabled",
    ),
    secondary: clsx(
      "bg-brand-secondary border-gradient border-color-gradient border-color-disabled-disabled hover:bg-brand-secondary-hover focus:bg-brand-secondary-focused active:bg-brand-secondary-pressed",
      "text-on-brand-secondary",
      "disabled:bg-disabled disabled:text-on-disabled",
    ),
    outlined: clsx(
      "bg-transparent border-gradient border-color-gradient border-color-disabled-disabled hover:bg-no-color-hover focus:bg-no-color-focused active:bg-no-color-pressed",
      "text-primary",
      "disabled:bg-disabled disabled:text-on-disabled",
    ),
    accent: clsx(
      disabled && "border-gradient border-color-disabled-disabled",
      !disabled &&
        "bg-gradient-angular-2 hover:bg-gradient-angular-1 focus:bg-gradient-angular-1 active:bg-gradient-angular-1",
      "text-on-brand-primary",
      "disabled:bg-disabled disabled:text-on-disabled",
    ),
    destructive: clsx(
      disabled && "border-gradient border-color-disabled-disabled",
      "bg-error-primary hover:bg-error-primary-hover focus:bg-error-primary-focused active:bg-error-primary-pressed",
      "text-on-error-primary",
      "disabled:bg-disabled disabled:text-on-disabled",
    ),
    text: clsx(
      "bg-transparent text-primary hover:text-no-color-text-hover focus:text-no-color-text-focused active:text-no-color-text-pressed",
      "disabled:text-standalone-text-disabled",
    ),
  }

  const sizeClasses: Record<
    ButtonSize,
    {
      padding: string
      text: string
      icon: number
      height: string
      textVariantHeight: string
    }
  > = {
    small: {
      padding: "px-14 py-6",
      text: "text-xs",
      icon: 16,
      height: "h-[30px]",
      textVariantHeight: "h-[18px]",
    },
    medium: {
      padding: "px-18 py-10",
      text: "text-sm",
      icon: 22,
      height: "h-[42px]",
      textVariantHeight: "h-[22px]",
    },
    large: {
      padding: "px-24 py-12",
      text: "text-md",
      icon: 24,
      height: "h-[46px]",
      textVariantHeight: "h-[24px]",
    },
  }

  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    variant !== "text" && sizeClasses[size].padding,
    sizeClasses[size].text,
    variant === "text"
      ? sizeClasses[size].textVariantHeight
      : sizeClasses[size].height,
    className,
  )

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(e)
    }
  }

  const buttonInnerContent = () => (
    <>
      {wallet && wallet}
      {leadingIcon && <Icon size={sizeClasses[size].icon} name={leadingIcon} />}
      <span>{text}</span>
      {trailingIcon && (
        <Icon size={sizeClasses[size].icon} name={trailingIcon} />
      )}
    </>
  )

  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {buttonInnerContent()}
    </button>
  )
}

export default Button
