import * as React from "react"
import clsx from "clsx"
import { icons, type IconName } from "."

export type { IconName }

export type IconProps = {
  name: IconName
  size?: number
  className?: string
  iconColor?: string
} & React.HTMLAttributes<HTMLDivElement>

const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  className = "",
  iconColor,
  ...props
}) => {
  const altText = `${name}-icon`

  const Svg: React.ElementType = icons[name]

  const baseClasses = clsx(className, iconColor)

  return (
    <div
      className={baseClasses}
      style={{ width: size, height: size }}
      {...props}
    >
      <Svg alt={altText} width={size} height={size} />
    </div>
  )
}

export default Icon
