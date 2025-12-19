import * as React from "react"
import Image from "next/image"
import clsx from "clsx"

export type IconProps = {
  name: IconName
  size?: number
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type IconName =
  | "Arrow-Left"
  | "Arrow-Right"
  | "Arrows"
  | "Ascending"
  | "Burn"
  | "Calendar"
  | "Checkmark"
  | "Chevron-down"
  | "Chevron-left"
  | "Chevron-right"
  | "Chevron-up"
  | "Close"
  | "Copy"
  | "Descending"
  | "Disconnect"
  | "Discord"
  | "Dot"
  | "Error"
  | "Export"
  | "External"
  | "Github"
  | "Group"
  | "Hide"
  | "Information"
  | "Legal"
  | "Linkedin"
  | "Link"
  | "Lock"
  | "Menu"
  | "Minus"
  | "Mint"
  | "Money"
  | "Notification"
  | "Placeholder"
  | "Plus"
  | "Search"
  | "Settings"
  | "Sort"
  | "Swap-Horizontal"
  | "Swap-Vertical"
  | "Twitter"
  | "Unlink"
  | "Wallet"
  | "Warning"

const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  className = "",
  ...props
}) => {
  const altText = `${name}-icon`
  const basePath = "/icons/"
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
