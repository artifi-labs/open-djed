import clsx from "clsx"
import React from "react"
import Coin, { type IconCoinName } from "./Coin"
import ButtonIcon from "./ButtonIcon"
import { on } from "node:cluster"

type Size = "small" | "medium" | "large"

const sizeMap: Record<Size, string> = {
  small: "text-sm",
  medium: "text-md",
  large: "text-lg",
}
export type AssetProps = {
  coins: IconCoinName[]
  coin?: IconCoinName
  checked: boolean
  size?: Size
  hasLeadingIcon?: boolean
  onCoinChange?: (coin: IconCoinName) => void
}

export const Asset: React.FC<AssetProps> = ({
  coins,
  coin,
  checked,
  size = "large",
  hasLeadingIcon = true,
  onCoinChange,
}) => {
  const textSize = sizeMap[size]
  const [internalCoin, setInternalCoin] = React.useState<IconCoinName>(coin ?? coins[0])
  const currentCoin = coin ?? internalCoin

  const handleClick = () => {
    const currentIndex = coins.indexOf(currentCoin)
    const nextCoin = coins[(currentIndex + 1) % coins.length]

    if (onCoinChange) {
      onCoinChange(nextCoin)
    } else {
      setInternalCoin(nextCoin)
    }
  }

  return (
    <div className={clsx("flex flex-row items-center gap-8", textSize)}>
      <Coin name={currentCoin} size={size} checked={checked} />
      <span className="font-normal">{currentCoin}</span>
      {hasLeadingIcon && (
        <ButtonIcon
          id={`${currentCoin}-leading-icon`}
          variant="onlyIcon"
          size="tiny"
          icon="Arrows"
          onClick={handleClick}
        />
      )}
    </div>
  )
}

export default Asset
