import { useProtocolData } from "@/hooks/useProtocolData"
import type { TokenType } from "@open-djed/api"
import { SkeletonWrapper } from "./SkeletonWrapper"
import { useTranslation } from "react-i18next"
import { useActionLabels } from "@/hooks/useLabels"
import { type Value, formatNumber, formatValue } from "@/lib/utils"
import Link from "next/link"

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
          {toUSD
            ? `$${formatNumber(toUSD(value ?? {}), { maximumFractionDigits: decimals ?? 2 })}`
            : "-"}
        </p>
      </SkeletonWrapper>
    </div>
  )
}

export const TokenDetails = ({ token, route }: TokenDetailsProps) => {
  const { t } = useTranslation()
  const { isPending, error, data } = useProtocolData()
  const toUSD = data ? (value: Value) => data.to(value, "DJED") : undefined
  const actionLabels = useActionLabels()

  if (error)
    return <div className="font-bold text-red-500">ERROR: {error.message}</div>

  return (
    <div className="bg-light-foreground dark:bg-dark-foreground mx-auto w-full overflow-x-auto rounded-xl p-4 shadow-md md:p-6">
      <h2 className="mb-6 text-2xl font-bold">
        {token} {t("tokenDetails.title")}
      </h2>
      <div className="flex min-w-fit flex-col gap-6">
        <div className="grid grid-cols-1 gap-3">
          <TokenDetailsRow
            isPending={isPending}
            label={t("tokenDetails.buyPrice")}
            value={data?.protocolData[token].buyPrice}
            toUSD={toUSD}
            decimals={3}
          />
          <TokenDetailsRow
            isPending={isPending}
            label={t("tokenDetails.sellPrice")}
            value={data?.protocolData[token].sellPrice}
            toUSD={toUSD}
            decimals={3}
          />
          <TokenDetailsRow
            isPending={isPending}
            label={t("tokenDetails.circulating")}
            value={data?.protocolData[token].circulatingSupply}
            toUSD={toUSD}
          />
          <TokenDetailsRow
            isPending={isPending}
            label={t("tokenDetails.mintAmount")}
            value={data?.protocolData[token].mintableAmount}
            toUSD={toUSD}
          />
          <TokenDetailsRow
            isPending={isPending}
            label={t("tokenDetails.burnAmount")}
            value={data?.protocolData[token].burnableAmount}
            toUSD={toUSD}
          />

          <Link
            href={route}
            className="bg-primary hover:bg-primary-hover flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2 font-bold text-white transition-opacity"
          >
            {actionLabels.Mint}/{actionLabels.Burn}
          </Link>
        </div>
      </div>
    </div>
  )
}
