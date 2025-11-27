import * as React from 'react'
import Tooltip from './Tooltip'
import { SkeletonWrapper } from './SkeletonWrapper'
import { Input } from './Input'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShenYieldChart } from './charts/ShenYieldChart'
import { useProtocolData } from '~/hooks/useProtocolData'
import Toast from './Toast'
import { formatNumber, formatValue, sumValues, type Value } from '~/utils'
import { expectedStakingReturn } from '~/lib/staking'

const Simulator = () => {
  const { isPending, error, data } = useProtocolData()
  const toUSD = data ? (value: Value) => data.to(value, 'DJED') : undefined
  const currentAdaValue = toUSD ? toUSD({ ADA: 1 }) : 0
  const { t } = useTranslation()

  const [shenAmount, setShenAmount] = useState<number | undefined>(1000)
  const [buyDate, setBuyDate] = useState<string>(new Date().toISOString().slice(0, 16))
  const [sellDate, setSellDate] = useState<string>(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString().slice(0, 16)
  })
  const [buyAdaPrice, setBuyAdaPrice] = useState<number | undefined>(0)
  const [sellAdaPrice, setSellAdaPrice] = useState<number | undefined>(0)
  const [toastProps, setToastProps] = useState<{ message: string; type: 'success' | 'error'; show: boolean }>(
    {
      message: '',
      type: 'success',
      show: false,
    },
  )

  const mintData = data?.tokenActionData('SHEN', 'Mint', shenAmount ?? 0)
  const burnData = data?.tokenActionData('SHEN', 'Burn', shenAmount ?? 0)

  const buyFees = sumValues(mintData?.operatorFee ?? {}, mintData?.actionFee ?? {})
  const sellFees = sumValues(burnData?.operatorFee ?? {}, burnData?.actionFee ?? {})

  const stakingRewards = expectedStakingReturn(
    data?.to({ SHEN: shenAmount }, 'ADA') ?? 0,
    buyDate,
    sellDate,
    {
      includePending: true,
    },
  )
  const feesShare = data?.to({ SHEN: (shenAmount ?? 0) * ((Math.random() * (3 - 2) + 2) / 100) }, 'ADA')

  const initialADAHoldings =
    (mintData?.toReceive.ADA ?? 0) + (data?.to ? data?.to({ SHEN: mintData?.toReceive.SHEN ?? 0 }, 'ADA') : 0)
  const finalADAHoldings =
    (burnData?.toReceive.ADA ?? 0) +
    stakingRewards.totalCreditedRewards +
    stakingRewards.totalPendingRewards +
    (feesShare ?? 0)
  const valueAtBuy = (toUSD ? toUSD({ ADA: initialADAHoldings }) : 0) * (buyAdaPrice ?? 0)
  const valueAtSell = (toUSD ? toUSD(burnData?.toReceive ?? {}) : 0) * (sellAdaPrice ?? 0)
  const adaPnL = valueAtSell - valueAtBuy
  const adaPnLPercentage = valueAtBuy > 0 ? (adaPnL / valueAtBuy) * 100 : 0

  const totalPnL =
    adaPnL + stakingRewards.totalCreditedRewards + stakingRewards.totalPendingRewards + (feesShare ?? 0)
  const totalPnLPercentage = valueAtBuy > 0 ? (totalPnL / valueAtBuy) * 100 : 0

  useEffect(() => {
    if (currentAdaValue > 0 && buyAdaPrice === 0 && sellAdaPrice === 0) {
      setBuyAdaPrice(Number(formatNumber(currentAdaValue, { maximumFractionDigits: 4 })))
      setSellAdaPrice(
        Number(formatNumber(currentAdaValue + currentAdaValue * 0.2, { maximumFractionDigits: 4 })),
      )
    }
  }, [currentAdaValue, buyAdaPrice, sellAdaPrice])

  const handleNumericInput = (val: string, setter: (n: number | undefined) => void) => {
    if (val === '') {
      setter(undefined)
    } else if (/^\d*\.?\d*$/.test(val) && !val.endsWith('.')) {
      setter(Number(val))
    }
  }

  if (error) {
    setToastProps({
      message: `${error}`,
      type: 'error',
      show: true,
    })
  }

  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-2 md:p-4 w-full max-w-[1026px]">
      <div className="flex flex-col justify-center items-center mb-6 w-full gap-8">
        <h2 className="text-2xl font-bold">{t('simulator.title')}</h2>
        <div className="flex flex-col lg:flex-row gap-8 justify-between w-full">
          {/* */}
          <div className="flex flex-col gap-3 justify-start items-start p-4 lg:w-[60%] w-full">
            <h3 className="text-xl font-bold">{t('simulator.inputs.title')}</h3>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.first')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.first')} />
              </div>
              <Input
                type="number"
                placeholder={t('input.amount')}
                id="shen-amount-input"
                value={shenAmount?.toString() || ''}
                onChange={(val) => handleNumericInput(val, setShenAmount)}
              />
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.second')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.second')} />
              </div>
              <Input
                id="buy-date-input"
                type="datetime-local"
                value={buyDate}
                onChange={setBuyDate}
                className="lg:w-[324px]"
              />
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.third')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.third')} />
              </div>
              <Input
                id="sell-date-input"
                type="datetime-local"
                value={sellDate}
                onChange={setSellDate}
                className="lg:w-[324px]"
              />
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.fourth')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.fourth')} />
              </div>
              <Input
                type="number"
                placeholder={t('input.amount')}
                id="buy-ada-price-input"
                value={buyAdaPrice?.toString() || ''}
                onChange={(val) => handleNumericInput(val, setBuyAdaPrice)}
              />
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.fifth')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.fifth')} />
              </div>
              <Input
                type="number"
                placeholder={t('input.amount')}
                id="sell-ada-price-input"
                value={sellAdaPrice?.toString() || ''}
                onChange={(val) => handleNumericInput(val, setSellAdaPrice)}
              />
            </div>
          </div>
          {/* */}
          <div className="flex flex-col gap-3 justify-start items-start p-4 lg:w-[40%] w-full">
            <h3 className="text-xl font-bold">{t('simulator.system.title')}</h3>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.first')}</p>
                <Tooltip text={t('simulator.system.tooltips.first')} />
              </div>
              <SkeletonWrapper isPending={isPending}>
                <p className="text-lg flex justify-center items-center">{formatValue(buyFees ?? {})}</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">
                  {toUSD ? `$${formatNumber(toUSD(buyFees ?? {}), { maximumFractionDigits: 2 })}` : '-'}
                </p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.second')}</p>
                <Tooltip text={t('simulator.system.tooltips.second')} />
              </div>
              <SkeletonWrapper isPending={isPending}>
                <p className="text-lg flex justify-center items-center">{formatValue(sellFees ?? {})}</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">
                  {toUSD ? `$${formatNumber(toUSD(sellFees ?? {}), { maximumFractionDigits: 2 })}` : '-'}
                </p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.third')}</p>
                <Tooltip text={t('simulator.system.tooltips.third')} />
              </div>
              <SkeletonWrapper isPending={isPending}>
                <p className="text-lg flex justify-center items-center">
                  {formatValue({ ADA: stakingRewards.totalCreditedRewards })}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400">
                  {toUSD
                    ? `$${formatNumber(toUSD({ ADA: stakingRewards.totalCreditedRewards }), {
                        maximumFractionDigits: 2,
                      })}`
                    : '-'}
                </p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.fourth')}</p>
                <Tooltip text={t('simulator.system.tooltips.fourth')} />
              </div>
              <SkeletonWrapper isPending={isPending}>
                <p className="text-lg flex justify-center items-center">{formatValue({ ADA: feesShare })}</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">
                  {toUSD
                    ? `$${formatNumber(toUSD({ ADA: feesShare }), {
                        maximumFractionDigits: 2,
                      })}`
                    : '-'}
                </p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.fifth')}</p>
                <Tooltip text={t('simulator.system.tooltips.fifth')} />
              </div>
              <SkeletonWrapper isPending={isPending}>
                <p className="text-lg flex justify-center items-center">{`$${formatNumber(adaPnL, {
                  maximumFractionDigits: 2,
                })}`}</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">{`${formatNumber(adaPnLPercentage, {
                  maximumFractionDigits: 2,
                })}%`}</p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.sixth')}</p>
                <Tooltip text={t('simulator.system.tooltips.sixth')} />
              </div>
              <SkeletonWrapper isPending={isPending}>
                <p className="text-lg flex justify-center items-center">{`$${formatNumber(totalPnL, {
                  maximumFractionDigits: 2,
                })}`}</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">{`${formatNumber(totalPnLPercentage, {
                  maximumFractionDigits: 2,
                })}%`}</p>
              </SkeletonWrapper>
            </div>
          </div>
        </div>
        <ShenYieldChart
          buyDate={buyDate}
          sellDate={sellDate}
          initialHoldings={initialADAHoldings}
          finalHoldings={finalADAHoldings}
          buyPrice={buyAdaPrice ?? 0}
          sellPrice={sellAdaPrice ?? 0}
          buyFees={buyFees.ADA ?? 0}
          sellFees={(sellFees.ADA ?? 0) + (data?.to ? data.to({ SHEN: sellFees.SHEN ?? 0 }, 'ADA') : 0)}
          stakingRewards={stakingRewards.credits}
        />
      </div>
      <Toast
        message={toastProps.message}
        show={toastProps.show}
        onClose={() => setToastProps({ ...toastProps, show: false })}
        type={toastProps.type}
      />
    </div>
  )
}

export default Simulator
