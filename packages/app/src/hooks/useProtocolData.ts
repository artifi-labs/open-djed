import { useToast } from "@/context/ToastContext"
import { env } from "@/lib/envLoader"
import { useProtocolDataQuery } from "@/queries/protocol/protocol/protocol.query"
import type { ADAValue, Value } from "@/types"
import { valueTo, sumValues, valueToADA } from "@/utils"
import type { TokenType, ActionType, MarketCapValue } from "@open-djed/api"
import {
  djedADABurnRate,
  djedADAMintRate,
  maxBurnableSHEN,
  maxMintableDJED,
  maxMintableSHEN,
  reserveRatio,
  shenADABurnRate,
  shenADAMintRate,
  operatorFee as getOperatorFee,
  Rational,
  djedADARate,
  shenADARate,
  djedUSDMarketCap,
  djedADAMarketCap,
  shenUSDMarketCap,
  shenADAMarketCap,
} from "@open-djed/math"
import { registryByNetwork } from "@open-djed/registry"
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"

type OracleDatumOverride = {
  oracleDatum?: {
    oracleFields: {
      adaUSDExchangeRate: { numerator: bigint; denominator: bigint }
    }
  }
}

type ProtocolDataComputed = {
  to: (
    value: Value,
    token: TokenType | "ADA",
    overrides?: OracleDatumOverride,
  ) => number
  oracleDatum: {
    oracleFields: {
      adaUSDExchangeRate: { numerator: bigint; denominator: bigint }
    }
  }
  poolDatum: {
    djedInCirculation: bigint
    shenInCirculation: bigint
    adaInReserve: bigint
    minADA: bigint
  }
  protocolData: Record<
    TokenType,
    {
      buyPrice: ADAValue
      sellPrice: ADAValue
      circulatingSupply: Value
      mintableAmount: Value
      burnableAmount: Value
      marketCap: MarketCapValue
    }
  > & {
    reserve: {
      amount: ADAValue
      ratio: number
    }
    refundableDeposit: ADAValue
  }
  tokenActionData: (
    token: TokenType,
    action: ActionType,
    amount: { type: "In" | "Out"; amount: number },
    overrides?: OracleDatumOverride,
  ) => {
    baseCost: Value
    actionFee: Value
    actionFeePercentage: number
    operatorFee: ADAValue
    totalCost: Value
    toSend: Value
    toReceive: Value
    price: ADAValue
  }
}

export function useProtocolData() {
  const { NETWORK } = env
  const { showToast } = useToast()
  const protocolDataQuery = useProtocolDataQuery()
  const t = useTranslations()

  useEffect(() => {
    if (!protocolDataQuery.isError) return
    showToast({
      message: t("api.protocolData.messages.fetchError"),
      type: "error",
    })
  }, [protocolDataQuery.isError, showToast])

  const data = useMemo<ProtocolDataComputed | undefined>(() => {
    const response = protocolDataQuery.data
    if (!response) return undefined

    const {
      oracleDatum: serializedOracleDatum,
      poolDatum: serializedPoolDatum,
    } = response
    const oracleDatum = {
      oracleFields: {
        adaUSDExchangeRate: {
          numerator: BigInt(
            serializedOracleDatum.oracleFields.adaUSDExchangeRate.numerator,
          ),
          denominator: BigInt(
            serializedOracleDatum.oracleFields.adaUSDExchangeRate.denominator,
          ),
        },
      },
    }
    const poolDatum = {
      djedInCirculation: BigInt(serializedPoolDatum.djedInCirculation),
      shenInCirculation: BigInt(serializedPoolDatum.shenInCirculation),
      adaInReserve: BigInt(serializedPoolDatum.adaInReserve),
      minADA: BigInt(serializedPoolDatum.minADA),
    }
    const registry = registryByNetwork[NETWORK]
    const refundableDeposit = { ADA: Number(poolDatum.minADA) / 1e6 }

    return {
      to: (
        value: Value,
        token: TokenType | "ADA",
        overrides?: {
          oracleDatum?: {
            oracleFields: {
              adaUSDExchangeRate: {
                numerator: bigint
                denominator: bigint
              }
            }
          }
        },
      ): number =>
        valueTo(value, poolDatum, overrides?.oracleDatum ?? oracleDatum, token),
      oracleDatum,
      poolDatum,
      protocolData: {
        DJED: {
          buyPrice: {
            ADA: djedADAMintRate(
              oracleDatum,
              registry.MintDJEDFeePercentage,
            ).toNumber(),
          },
          sellPrice: {
            ADA: djedADABurnRate(
              oracleDatum,
              registry.BurnDJEDFeePercentage,
            ).toNumber(),
          },
          circulatingSupply: {
            DJED: Number(poolDatum.djedInCirculation) / 1e6,
          },
          mintableAmount: {
            DJED:
              Number(
                maxMintableDJED(
                  poolDatum,
                  oracleDatum,
                  registry.MintDJEDFeePercentage,
                ),
              ) / 1e6,
          },
          burnableAmount: {
            DJED: Number(poolDatum.djedInCirculation) / 1e6,
          },
          marketCap: {
            USD: djedUSDMarketCap(poolDatum).toBigInt(),
            ADA: djedADAMarketCap(poolDatum, oracleDatum).toBigInt(),
          },
        },
        SHEN: {
          buyPrice: {
            ADA: shenADAMintRate(
              poolDatum,
              oracleDatum,
              registry.MintSHENFeePercentage,
            ).toNumber(),
          },
          sellPrice: {
            ADA: shenADABurnRate(
              poolDatum,
              oracleDatum,
              registry.BurnSHENFeePercentage,
            ).toNumber(),
          },
          circulatingSupply: {
            SHEN: Number(poolDatum.shenInCirculation) / 1e6,
          },
          mintableAmount: {
            SHEN:
              Number(
                maxMintableSHEN(
                  poolDatum,
                  oracleDatum,
                  registry.MintSHENFeePercentage,
                ),
              ) / 1e6,
          },
          burnableAmount: {
            SHEN:
              Number(
                maxBurnableSHEN(
                  poolDatum,
                  oracleDatum,
                  registry.MintSHENFeePercentage,
                ),
              ) / 1e6,
          },
          marketCap: {
            USD: shenUSDMarketCap(poolDatum, oracleDatum).toBigInt(),
            ADA: shenADAMarketCap(poolDatum, oracleDatum).toBigInt(),
          },
        },
        reserve: {
          amount: { ADA: Number(poolDatum.adaInReserve) / 1e6 },
          ratio: reserveRatio(poolDatum, oracleDatum).toNumber(),
        },
        refundableDeposit,
      },
      tokenActionData: (
        token: TokenType,
        action: ActionType,
        amount: { type: "In" | "Out"; amount: number },
        overrides,
      ) => {
        const activeOracleDatum = overrides?.oracleDatum ?? oracleDatum
        const actionFeeRatio = new Rational(
          registry[`${action}${token}FeePercentage`],
        )
        const actionFeePercentage = actionFeeRatio.toNumber() * 100
        const amountBigInt = BigInt(Math.floor(amount.amount * 1e6))
        const exchangeRate =
          token === "DJED"
            ? djedADARate(activeOracleDatum)
            : shenADARate(poolDatum, activeOracleDatum)
        if (action === "Mint") {
          if (amount.type === "Out") {
            const baseCostRational = exchangeRate.mul(amountBigInt)
            const baseCost = {
              ADA: baseCostRational.div(1_000_000n).toNumber(),
            }
            const actionFeeRational = actionFeeRatio.mul(baseCostRational)
            const actionFee = {
              ADA: actionFeeRational.div(1_000_000n).toNumber(),
            }
            const operatorFee = {
              ADA: new Rational(
                getOperatorFee(
                  baseCostRational.add(actionFeeRational),
                  registry.operatorFeeConfig,
                ),
              )
                .div(1_000_000n)
                .toNumber(),
            }
            const totalCost = sumValues(baseCost, actionFee, operatorFee)
            return {
              baseCost,
              actionFee,
              actionFeePercentage: actionFeeRatio.toNumber() * 100,
              operatorFee,
              totalCost,
              toSend: sumValues(totalCost, refundableDeposit),
              toReceive: sumValues(
                { [token]: amount.amount },
                refundableDeposit,
              ),
              price: {
                ADA:
                  valueToADA(totalCost, poolDatum, activeOracleDatum) /
                  amount.amount,
              },
            }
          }
          const amountADA = exchangeRate.mul(amountBigInt)
          const baseCostRationalToken = actionFeeRatio
            .add(1n)
            .invert()
            .mul(amountBigInt)
          const baseCostRational = baseCostRationalToken.mul(exchangeRate)
          const baseCost = {
            ADA: baseCostRational.div(1_000_000n).toNumber(),
          }
          const actionFeeRational = baseCostRational.negate().add(amountADA)
          const actionFee = {
            ADA: actionFeeRational.div(1_000_000n).toNumber(),
          }
          const operatorFeeBigInt = getOperatorFee(
            baseCostRational.toBigInt(),
            registry.operatorFeeConfig,
          )
          const operatorFee = {
            ADA: new Rational({
              numerator: operatorFeeBigInt,
              denominator: 1_000_000n,
            }).toNumber(),
          }
          const totalCost = sumValues(baseCost, actionFee, operatorFee)
          // FIXME: We slightly underestimate this. I don't know why but for now it's ok. Better to underestimate than overestimate.
          const toReceive = {
            [token]: baseCostRationalToken.div(1_000_000n).toNumber(),
          }
          return {
            baseCost,
            actionFee,
            actionFeePercentage,
            operatorFee,
            totalCost,
            toSend: sumValues(totalCost, refundableDeposit),
            toReceive,
            price: {
              ADA:
                valueToADA(toReceive, poolDatum, activeOracleDatum) /
                valueTo(totalCost, poolDatum, activeOracleDatum, token),
            },
          }
        }
        if (action === "Burn" && amount.type === "In") {
          const baseCostRational = actionFeeRatio
            .add(1n)
            .invert()
            .mul(amountBigInt)
          const baseCost = {
            [token]: baseCostRational.div(1_000_000n).toNumber(),
          }
          const actionFeeRational = baseCostRational.negate().add(amountBigInt)
          const actionFee = {
            [token]: actionFeeRational.div(1_000_000n).toNumber(),
          }
          const operatorFeeBigInt = getOperatorFee(
            baseCostRational.mul(exchangeRate).toBigInt(),
            registry.operatorFeeConfig,
          )
          const operatorFee = {
            ADA: new Rational({
              numerator: operatorFeeBigInt,
              denominator: 1_000_000n,
            }).toNumber(),
          }
          const totalCost = {
            ...operatorFee,
            [token]: baseCostRational
              .add(actionFeeRational)
              .div(1_000_000n)
              .toNumber(),
          }
          // FIXME: We slightly underestimate this. I don't know why but for now it's ok. Better to underestimate than overestimate.
          const toReceive = {
            ADA: baseCostRational.mul(exchangeRate).div(1_000_000n).toNumber(),
          }
          return {
            baseCost,
            actionFee,
            actionFeePercentage,
            operatorFee,
            totalCost,
            toSend: sumValues(totalCost, refundableDeposit),
            toReceive,
            price: {
              ADA:
                valueToADA(toReceive, poolDatum, activeOracleDatum) /
                valueTo(totalCost, poolDatum, activeOracleDatum, token),
            },
          }
        }
        throw new Error(
          `Invalid action: ${action} ${token} and amount type: ${amount.type}`,
        )
      },
    }
  }, [NETWORK, protocolDataQuery.data])

  return {
    ...protocolDataQuery,
    data,
  }
}
