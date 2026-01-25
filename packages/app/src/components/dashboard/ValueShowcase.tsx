import React from "react"
import Asset, { type AssetProps } from "../Asset"
import { type IconName } from "../icons/Icon"
import Tag from "../Tag"
import Divider from "../Divider"
import { formatNumber } from "@/lib/utils"

type ValueShowcaseProps = {
  asset: AssetProps
  availableAmount?: string
  hasAvailableAmount?: boolean
  value?: string
  defaultValue?: string
  hasTag?: boolean
  tagLeadingIcon?: IconName
  tagTrailingIcon?: IconName
  suffix: string
}

const ValueShowcase: React.FC<ValueShowcaseProps> = ({
  asset,
  availableAmount,
  hasAvailableAmount,
  value,
  defaultValue = "0.00",
  hasTag = false,
  tagLeadingIcon,
  tagTrailingIcon,
  suffix,
}) => {
  const showValue = value || defaultValue

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="flex flex-col gap-6">
        <span className="text-tertiary text-sm font-medium">
          {formatNumber(parseFloat(showValue), { maximumFractionDigits: 4 })}
        </span>
        {hasAvailableAmount && availableAmount && (
          <span className="text-tertiary text-xxs">
            Available: {availableAmount}
          </span>
        )}
      </div>
      <div className="flex w-fit flex-row items-center justify-center gap-10">
        {hasTag && (
          <>
            <Tag
              type="surface"
              role="Primary"
              size="small"
              text="Tag"
              leadingIcon={tagLeadingIcon}
              trailingIcon={tagTrailingIcon}
            />
            <Divider orientation="vertical" />
          </>
        )}
        <span className="text-tertiary text-xxs">{suffix}</span>
        <Asset {...asset} />
      </div>
    </div>
  )
}

export default ValueShowcase
