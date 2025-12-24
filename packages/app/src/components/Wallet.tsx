import * as React from "react"
import Image from "next/image"
import clsx from "clsx"

export type WalletProps = {
  name: WalletName
  size?: number
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type WalletName =
  | "ETERNL"
  | "LACE"
  | "VESPR"
  | "BEGIN"
  | "PLACEHOLDER"
  | "YOROI"
  | "GEROWALLET"

const Wallet: React.FC<WalletProps> = ({
  name,
  size = 24,
  className = "",
  ...props
}) => {
  const altText = `${name}-icon`
  const basePath = "/coins/"
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

export default Wallet
