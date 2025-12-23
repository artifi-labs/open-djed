import React from "react"
import clsx from "clsx"
import Button from "./Button"
import ButtonIcon from "./ButtonIcon"
import Icon, { type IconName } from "./Icon"

type Type = "success" | "error" | "attention"

type ToastItemBase = {
  type: Type
  text: string
  leadingIcon?: IconName
} & React.HTMLAttributes<HTMLDivElement>

type InfoProps = Pick<ToastItemBase, "type" | "text" | "leadingIcon">

type ToastItemWithClose = {
  closeIcon: true
  onCloseClick: () => void
}

type ToastItemWithoutClose = {
  closeIcon: false
  onCloseClick?: undefined
}

type ToastItemWithAction = {
  action: true
  actionText: string
}

type ToastItemWithoutAction = {
  action: false
  actionText?: undefined
}

export type ToastItemProps = ToastItemBase &
  (ToastItemWithClose | ToastItemWithoutClose) &
  (ToastItemWithAction | ToastItemWithoutAction)

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
      <span className="wrap-break-word whitespace-normal">{text}</span>
    </div>
  )
}

const ToastItem: React.FC<ToastItemProps> = ({
  type,
  text = "",
  leadingIcon,
  action,
  actionText,
  closeIcon,
  onCloseClick,
  ...props
}) => {
  const baseClasses =
    "max-w-[343px] inline-flex items-center gap-12 rounded-8 px-12 py-8 gap-12"

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

export default ToastItem
