import { useProtocolData } from '~/hooks/useProtocolData'
import { NavLink } from 'react-router'
import type { TokenType } from '@open-djed/api'
import { formatNumber, formatValue, type Value } from '~/utils'
import { SkeletonWrapper } from './SkeletonWrapper'

type TokenDetailsProps = {
  token: TokenType
  route: string
}

const TokenDetailsRow = ({
  isPending,
  label,
  value,
  toUSD,
  decimals,
}: {
  isPending: boolean
  label: string
  value: Value | undefined
  toUSD?: (value: Value) => number
  decimals?: number
}) => {
  return (
    <div className="flex flex-row justify-between">
      <p className="font-medium">{label}</p>
      <SkeletonWrapper isPending={isPending}>
        <p className="text-lg">{formatValue(value ?? {})}</p>
        <p className="text-xs text-gray-700 dark:text-gray-400">
          {toUSD ? `$${formatNumber(toUSD(value ?? {}), { maximumFractionDigits: decimals ?? 2 })}` : '-'}
        </p>
      </SkeletonWrapper>
    </div>
  )
}

export const TokenDetails = ({ token, route }: TokenDetailsProps) => {
  const { isPending, error, data } = useProtocolData()
  if (error) return <div className="text-red-500 font-bold">ERROR: {error.message}</div>
  const toUSD = data ? (value: Value) => data.to(value, 'DJED') : undefined
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-4 md:p-6 w-full mx-auto overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 ">{token} Token Details</h2>
      <div className="flex flex-col gap-6 min-w-fit">
        <div className="grid grid-cols-1 gap-3">
          <TokenDetailsRow
            isPending={isPending}
            label="Buy Price"
            value={data?.protocolData[token].buyPrice}
            toUSD={toUSD}
            decimals={3}
          />
          <TokenDetailsRow
            isPending={isPending}
            label="Sell Price"
            value={data?.protocolData[token].sellPrice}
            toUSD={toUSD}
            decimals={3}
          />
          <TokenDetailsRow
            isPending={isPending}
            label="Circulating Supply"
            value={data?.protocolData[token].circulatingSupply}
            toUSD={toUSD}
          />
          <TokenDetailsRow
            isPending={isPending}
            label="Mintable Amount"
            value={data?.protocolData[token].mintableAmount}
            toUSD={toUSD}
          />
          <TokenDetailsRow
            isPending={isPending}
            label="Burnable Amount"
            value={data?.protocolData[token].burnableAmount}
            toUSD={toUSD}
          />

          <NavLink
            to={route}
            className="w-full text-white font-bold bg-primary hover:bg-primary-hover cursor-pointer transition-opacity px-4 py-2 rounded-lg flex items-center justify-center"
          >
            Mint/Burn
          </NavLink>
        </div>
      </div>
    </div>
  )
}
