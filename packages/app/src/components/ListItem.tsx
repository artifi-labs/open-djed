import * as React from "react"
import Icon, { type IconName } from "./icons/Icon"
import type Button from "./Button"
import Divider from "./Divider"
import Mask from "./Mask"
import Coin from "./Coin"
import type { IconCoinName } from "./Coin"
import type { WalletName } from "./Wallet"
import Wallet from "./Wallet"
import { clsx } from "clsx"

type BaseProps = {
  divider?: boolean
  coin?: IconCoinName
  checked?: boolean
  wallet?: WalletName
  text: string
  action?: React.ReactElement<typeof Button>
  icon?: IconName
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

type AmountProps = BaseProps & {
  amount: true
  amountUpperText: string
  amountLowerText: string
  hideAmount: boolean
}

type NoAmountProps = BaseProps & {
  amount?: false
  amountUpperText?: string
  amountLowerText?: string
  hideAmount?: boolean
}

export type ListItemProps = BaseProps & (NoAmountProps | AmountProps)

const AmountMaskRow = ({ length }: { length: number }) => (
  <div className="flex h-20 items-center justify-end gap-4">
    <Mask length={length} />
  </div>
)

const ListItem: React.FC<ListItemProps> = ({
  divider = false,
  coin,
  checked,
  wallet,
  text,
  action,
  icon,
  amountLowerText,
  amountUpperText,
  amount = false,
  hideAmount = false,
  onClick,
  className,
}) => {
  return (
    <div
      className={clsx(
        "block w-full overflow-hidden",
        "hover:rounded-4 focus:rounded-4 active:rounded-4",
      )}
    >
      <div
        className={clsx(
          "hover:bg-no-color-hover active:bg-no-color-pressed focus:bg-no-color-focused",
          "inline-flex w-full items-center justify-between gap-8 bg-transparent p-8",
          className,
        )}
        onClick={onClick}
      >
        <div className="flex flex-1 flex-row items-center gap-8">
          {coin && <Coin name={coin} size="large" checked={checked} />}
          {wallet && <Wallet name={wallet} size={36} />}
          <span className="text-primary text-sm font-normal">{text}</span>
        </div>

        {action && action}

        {amount && (
          <div className="inline-flex items-center justify-center">
            {amount && (
              <div className="flex flex-col items-end justify-start gap-2">
                {hideAmount ? (
                  <AmountMaskRow length={8} />
                ) : (
                  <span className="text-on-brand-primary flex h-20 items-center justify-start text-xs font-medium">
                    {amountUpperText}
                  </span>
                )}

                {hideAmount ? (
                  <AmountMaskRow length={4} />
                ) : (
                  <span className="text-secondary flex h-20 items-center justify-start text-xs leading-tight font-normal">
                    {amountLowerText}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        {icon && <Icon name={icon} size={18} />}
      </div>

      {divider && <Divider />}
    </div>
  )
}

export default ListItem
