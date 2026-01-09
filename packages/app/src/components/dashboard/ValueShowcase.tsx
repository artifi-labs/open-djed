import React from "react"
import Asset, { type AssetProps } from "../Asset"
import { type IconName } from "../Icon"
import Tag from "../Tag"
import Divider from "../Divider"

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
  return (
    <div className="flex w-full flex-row items-center justify-between">
      <span className="text-tertiary text-sm leading-5 font-medium">
        {value || defaultValue}
      </span>
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
        {hasAvailableAmount && availableAmount && (
          <>
            <span className="text-tertiary text-xxs leading-4">
              Available: {availableAmount}
            </span>
            <Divider orientation="vertical" />
          </>
        )}
        <span className="text-tertiary text-xxs leading-4">{suffix}</span>
        <Asset {...asset} />
      </div>
    </div>
  )
}

export default ValueShowcase
