import clsx from "clsx"
import React from "react"
import Coin, { type IconCoinName } from "./Coin"
import ButtonIcon from "./ButtonIcon"

type Size = "small" | "medium" | "large"

const sizeMap: Record<Size, string> = {
  small: "text-sm",
  medium: "text-md",
  large: "text-lg",
}

export type AssetProps = {
  coin: IconCoinName
  checked: boolean
  size?: Size
  hasLeadingIcon?: boolean
}

const Asset: React.FC<AssetProps> = ({ 
  coin, 
  checked, 
  size = "large",
  hasLeadingIcon = true,
}) => {
  const textSize = sizeMap[size]

  return (
    <div className={clsx("flex flex-row items-center gap-8", textSize)}>
      <Coin name={coin} size={size} checked={checked} />
      <span className="font-normal">{coin}</span>
      {hasLeadingIcon && (
        <ButtonIcon
          id={`${coin}-leading-icon`}
          variant="onlyIcon"
          size="tiny"
          icon="Arrows"
        />
      )}

    </div>
  )
}

export default Asset
