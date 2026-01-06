import React from 'react'
import Asset, { type AssetProps } from '../Asset'
import { type IconName } from '../Icon'
import Tag from '../Tag'
import Divider from '../Divider'
import { useProtocolData } from '@/hooks/useProtocolData'
import { Token } from '@/lib/tokens'
import { formatNumber } from '@/lib/utils'

type ValueShowcaseProps = {
  token: Token
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

const ValueShowcase: React.FC<ValueShowcaseProps> = ({token, asset, availableAmount, hasAvailableAmount, value, defaultValue= '0.00', hasTag = false, tagLeadingIcon, tagTrailingIcon, suffix}) => {
  return (
    <div className='flex flex-row w-full justify-between items-center'>
      <span className='text-tertiary font-medium text-sm leading-5'>{value || defaultValue}</span>
      <div className='flex flex-row justify-center items-center w-fit gap-10'>
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
            <Divider orientation='vertical'/>
          </>
        )}
        {hasAvailableAmount && availableAmount && (
          <>
            <span className='text-tertiary text-xxs leading-4'>
              Available: {availableAmount}
            </span>
            <Divider orientation='vertical'/>
          </>
        )}
        <span className='text-tertiary text-xxs leading-4'>
          {suffix}
        </span>
        <Asset {...asset} />
      </div>
    </div>
  )
}

export default ValueShowcase