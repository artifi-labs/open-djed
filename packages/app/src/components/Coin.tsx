import React from "react"
import Image from "next/image"
import clsx from "clsx"

export type CoinProps = {
  name: IconCoinName
  size?: "small" | "medium" | "large"
  alt?: string
  checked?: boolean
  className?: string
  [key: string]: unknown
}

export type IconCoinName = "PLACEHOLDER" | "ADA" | "DJED" | "SHEN"

const Coin: React.FC<CoinProps> = ({
  name,
  size = "small",
  alt,
  checked = true,
  className = "",
  ...props
}) => {
  const altText = alt || name
  const baseSrcPath = "/coins"
  const srcFile = `${baseSrcPath}/${name}.svg`

  // size mapping
  const coinSizePx = { small: 18, medium: 24, large: 32 }[size]
  const checkSizePx = { small: 8, medium: 10, large: 12 }[size]

  // clsx classes
  const containerClass = clsx("relative inline-flex", className)
  const checkWrapperClass = clsx(
    "absolute -bottom-[2px] -right-[2px] rounded-full bg-success-primary flex items-center justify-center",
    {
      "w-2 h-2": size === "small",
      "w-2.5 h-2.5": size === "medium",
      "w-3 h-3": size === "large",
    },
  )

  return (
    <div
      className={containerClass}
      style={{ width: coinSizePx, height: coinSizePx }}
      {...props}
    >
      <Image src={srcFile} alt={altText} fill className="object-contain" />

      {checked && (
        <div className={checkWrapperClass}>
          <div
            className="relative"
            style={{ width: checkSizePx / 1.5, height: checkSizePx / 1.5 }}
          >
            <Image
              src={`${baseSrcPath}/check.svg`}
              alt="check"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Coin
