import * as React from "react"
import Image from "next/image"
import clsx from "clsx"

export type IconProps = {
  name: IconName
  size?: number
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type IconName =
  | "Checkmark"
  | "Discord"
  | "External"
  | "Github"
  | "Legal"
  | "Linkedin"
  | "Menu"
  | "Settings"
  | "Twitter"

const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  className = "",
  ...props
}) => {
  const altText = `${name}-icon`
  const basePath = "/components/icons/"
  const srcFile = `${basePath}/${name}.svg`

  return (
    <div
      className={clsx("relative", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <Image src={srcFile} alt={altText} fill className="object-contain" />
    </div>
  )
}

export default Icon
