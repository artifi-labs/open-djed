import clsx from "clsx"
import React from "react"
import Coin, { type IconCoinName } from "./Coin"
import ButtonIcon from "./ButtonIcon"
import { type IconName } from "./icons/Icon"

type Size = "small" | "medium" | "large"

const sizeMap: Record<Size, string> = {
  small: "text-sm",
  medium: "text-md",
  large: "text-lg",
}

export type AssetProps = {
  coins?: IconCoinName[]
  coin?: IconCoinName
  checked: boolean
  size?: Size
  hasLeadingIcon?: boolean
  buttonIcon?: IconName
  onCoinChange?: (coin: IconCoinName) => void
}

export const Asset: React.FC<AssetProps> = ({
  coins,
  coin,
  checked,
  size = "large",
  hasLeadingIcon = true,
  buttonIcon = "Arrows",
  onCoinChange,
}) => {
  const textSize = sizeMap[size]

  const [internalCoin, setInternalCoin] = React.useState<
    IconCoinName | undefined
  >(coin ?? coins?.[0])

  const currentCoin = coin ?? internalCoin

  const canRotate = coins && coins.length > 1

  const handleClick = () => {
    if (!canRotate || !currentCoin) return

    const currentIndex = coins.indexOf(currentCoin)
    const nextCoin = coins[(currentIndex + 1) % coins.length]

    if (onCoinChange) {
      onCoinChange(nextCoin)
    } else {
      setInternalCoin(nextCoin)
    }
  }

  if (!currentCoin) return null

  return (
    <div className={clsx("flex flex-row items-center gap-8", textSize)}>
      <Coin name={currentCoin} size={size} checked={checked} />
      <div className="flex items-center gap-4">
        <span className="font-normal">{currentCoin}</span>
        {hasLeadingIcon && canRotate && (
          <ButtonIcon
            id={`${currentCoin}-leading-icon`}
            variant="onlyIcon"
            size="tiny"
            icon={buttonIcon}
            onClick={handleClick}
          />
        )}
      </div>
    </div>
  )
}

export default Asset
