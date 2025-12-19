"use client"
import * as React from "react"
import Button from "./Button"
import Icon, { type IconName } from "./Icon"
import clsx from "clsx"
import Loading from "./loading/Loading"
import Skrim from "./Skrim"
import type { ButtonVariant } from "./Button"

type Type = "Info" | "Warning" | "Error" | "Success" | "Loading"

type BaseDialogProps = {
  title?: string
  description?: string
  type: Type
  hasActions: boolean
  hasIcon: boolean
  hasSkrim?: boolean
}

type DialogPropsWithPrimaryButton = {
  hasActions: true
  hasPrimaryButton: true
  primaryButtonVariant?: ButtonVariant
  primaryButtonLabel: string
  onPrimaryButtonClick?: () => void
}

type DialogPropsWithoutPrimaryButton = {
  hasActions: false
  hasPrimaryButton?: false
  primaryButtonVariant?: never
  primaryButtonLabel?: never
  onPrimaryButtonClick?: never
}

type DialogPropsWithSecondaryButton = {
  hasActions: true
  hasSecondaryButton: true
  secondaryButtonVariant?: ButtonVariant
  secondaryButtonLabel: string
  onSecondaryButtonClick?: () => void
}

type DialogPropsWithoutSecondaryButton = {
  hasActions: false
  hasSecondaryButton?: false
  secondaryButtonVariant?: never
  secondaryButtonLabel?: never
  onSecondaryButtonClick?: never
}

export type DialogProps = BaseDialogProps &
  (DialogPropsWithPrimaryButton | DialogPropsWithoutPrimaryButton) &
  (DialogPropsWithSecondaryButton | DialogPropsWithoutSecondaryButton)

type DialogIconProps = {
  type: Type
}

const DialogIcon: React.FC<DialogIconProps> = ({ type }) => {
  const baseClasses = "flex items-center rounded-full p-12"
  const iconSize = 24

  const typeClasses: Record<Type, string> = {
    Info: "ring ring-border-secondary bg-surface-secondary",
    Loading: "ring ring-border-secondary bg-surface-secondary",
    Warning: "bg-warning-primary",
    Error: "bg-error-primary",
    Success: "bg-success-primary",
  }

  const typeIcons: Record<Exclude<Type, "Loading">, IconName> = {
    Info: "Information",
    Warning: "Warning",
    Error: "Error",
    Success: "Checkmark",
  }

  const className = clsx(baseClasses, typeClasses[type])

  return (
    <div className={className}>
      {type === "Loading" ? (
        <Loading size={iconSize} />
      ) : (
        <Icon name={typeIcons[type]} size={iconSize} />
      )}
    </div>
  )
}

const Dialog: React.FC<DialogProps> = ({
  title,
  type,
  description,
  hasActions,
  hasIcon,
  hasPrimaryButton,
  primaryButtonVariant = "primary",
  hasSecondaryButton,
  secondaryButtonVariant = "secondary",
  primaryButtonLabel,
  secondaryButtonLabel,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  hasSkrim = false,
}) => {
  const dialogContent = (
    <div className="bg-surface-modal rounded-card border-border-secondary desktop:w-105 relative z-1001 flex w-85.75 flex-col items-center justify-center gap-24 border p-32">
      {/* Icon */}
      {hasIcon && <DialogIcon type={type} />}

      {/* Header */}
      <div className="flex flex-col items-center gap-8 self-stretch text-center">
        {title && <h3>{title}</h3>}
        {description && <p className="text-secondary text-sm">{description}</p>}
      </div>

      {/* Actions */}
      {hasActions && (
        <div className="desktop:flex-row flex w-full flex-col gap-12">
          {hasSecondaryButton && (
            <Button
              variant={secondaryButtonVariant}
              size="large"
              text={secondaryButtonLabel}
              onClick={onSecondaryButtonClick}
              className="flex-1"
            />
          )}
          {hasPrimaryButton && (
            <Button
              variant={primaryButtonVariant}
              size="large"
              text={primaryButtonLabel}
              onClick={onPrimaryButtonClick}
              className="desktop:order-last order-first flex-1"
            />
          )}
        </div>
      )}
    </div>
  )

  if (hasSkrim) {
    return (
      <div className="fixed inset-0 z-1000 flex items-center justify-center select-none">
        <Skrim />
        {dialogContent}
      </div>
    )
  }

  return dialogContent
}

export default Dialog
