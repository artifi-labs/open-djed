import React from "react"
import clsx from "clsx"
import type { IconName } from "./Icon"
import Icon from "./Icon"
import ButtonIcon from "./ButtonIcon"
import Button from "./Button"

type Type = "success" | "error" | "attention"

type SnackbarBase = {
  type: Type
  text: string
  leadingIcon?: IconName
  full?: boolean
} & React.HTMLAttributes<HTMLDivElement>

type InfoProps = Pick<SnackbarBase, "type" | "text" | "leadingIcon">

type SnackbarWithClose = {
  closeIcon: true
  onCloseClick: () => void
}

type SnackbarWithoutClose = {
  closeIcon: false
  onCloseClick?: undefined
}

type SnackbarWithAction = {
  action: true
  actionText: string
}

type SnackbarWithoutAction = {
  action: false
  actionText?: undefined
}

export type SnackbarProps = SnackbarBase &
  (SnackbarWithClose | SnackbarWithoutClose) &
  (SnackbarWithAction | SnackbarWithoutAction)

const Info: React.FC<InfoProps> = ({ text, type, leadingIcon = null }) => {
  const baseClasses: string = "gap-8 text-xs flex items-center"

  const typeClasses: Record<Type, string> = {
    success: "text-on-success-primary",
    error: "text-on-error-primary",
    attention: "text-on-warning-primary",
  }

  const className: string = clsx(baseClasses, typeClasses[type])

  return (
    <div className={className}>
      {leadingIcon && (
        <Icon name={leadingIcon} size={16} className="shrink-0" />
      )}
      <span className="break">{text}</span>
    </div>
  )
}

const Snackbar: React.FC<SnackbarProps> = ({
  type,
  text = "",
  leadingIcon,
  action,
  actionText,
  closeIcon,
  onCloseClick,
  full = false,
  ...props
}) => {
  const baseClasses = `${full ? "w-full" : "max-w-[343px] "} inline-flex items-center gap-12 rounded-8 px-12 py-8 gap-12`

  const typeClasses: Record<Type, string> = {
    success: "bg-success-primary",
    error: "bg-error-primary",
    attention: "bg-warning-primary",
  }

  const divClasses = clsx(baseClasses, typeClasses[type])

  return (
    <div className={divClasses} {...props}>
      <Info text={text} type={type} leadingIcon={leadingIcon} />
      {action && <Button variant="text" size="small" text={actionText} />}
      {closeIcon && (
        <ButtonIcon
          variant="onlyIcon"
          icon="Close"
          size="tiny"
          onClick={onCloseClick}
        />
      )}
    </div>
  )
}

export default Snackbar
