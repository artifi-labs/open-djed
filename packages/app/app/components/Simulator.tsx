import * as React from 'react'
import Tooltip from './Tooltip'
import { SkeletonWrapper } from './SkeletonWrapper'
import { Input } from './Input'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShenYieldChart } from './charts/ShenYieldChart'

type SimulatorProps = {
  currentAdaValue: number
}

const Simulator: React.FC<SimulatorProps> = ({ currentAdaValue }) => {
  const { t } = useTranslation()
  const [shenAmount, setShenAmount] = useState<number>(1000)
  const [buyDate, setBuyDate] = useState<string>(new Date().toISOString().slice(0, 16))
  const [sellDate, setSellDate] = useState<string>(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString().slice(0, 16)
  })
  const [buyAdaPrice, setBuyAdaPrice] = useState<number>(currentAdaValue)
  const [sellAdaPrice, setSellAdaPrice] = useState<number>(currentAdaValue + currentAdaValue * 0.2)

  const handleNumericInput = (val: string) => {
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      return Number(val)
    }
  }

  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-2 md:p-4 w-full max-w-[1026px]">
      <div className="flex flex-col justify-center items-center mb-6 w-full gap-12">
        <h2 className="text-2xl font-bold mb-6">{t('simulator.title')}</h2>
        <div className="flex flex-col lg:flex-row gap-8 justify-between w-full">
          {/* */}
          <div className="flex flex-col gap-3 justify-center items-start p-4 lg:w-[60%] w-full">
            <h3 className="text-xl font-bold">{t('simulator.inputs.title')}</h3>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.first')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.first')} />
              </div>
              <Input
                placeholder={t('input.amount')}
                id="shen-amount-input"
                value={shenAmount?.toString() || ''}
                onChange={(val) => {
                  const parsedVal = handleNumericInput(val)
                  if (typeof parsedVal === 'number') setShenAmount(parsedVal)
                }}
              />
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.second')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.second')} />
              </div>
              <Input id="buy-date-input" type="datetime-local" value={buyDate} onChange={setBuyDate} />
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.third')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.third')} />
              </div>
              <Input id="sell-date-input" type="datetime-local" value={sellDate} onChange={setSellDate} />
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.fourth')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.fourth')} />
              </div>
              <Input
                placeholder={t('input.amount')}
                id="buy-ada-price-input"
                value={buyAdaPrice?.toString() || ''}
                onChange={(val) => {
                  const parsedVal = handleNumericInput(val)
                  if (typeof parsedVal === 'number') setBuyAdaPrice(parsedVal)
                }}
              />
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.inputs.labels.fifth')}</p>
                <Tooltip text={t('simulator.inputs.tooltips.fifth')} />
              </div>
              <Input
                placeholder={t('input.amount')}
                id="sell-ada-price-input"
                value={sellAdaPrice?.toString() || ''}
                onChange={(val) => {
                  const parsedVal = handleNumericInput(val)
                  if (typeof parsedVal === 'number') setSellAdaPrice(parsedVal)
                }}
              />
            </div>
          </div>
          {/* */}
          <div className="flex flex-col gap-3 justify-center items-start p-4 lg:w-[40%] w-full">
            <h3 className="text-xl font-bold">{t('simulator.system.title')}</h3>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.first')}</p>
                <Tooltip text={t('simulator.system.tooltips.first')} />
              </div>
              <SkeletonWrapper isPending={false}>
                <p className="text-lg flex justify-center items-center">fees</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">fees</p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.second')}</p>
                <Tooltip text={t('simulator.system.tooltips.second')} />
              </div>
              <SkeletonWrapper isPending={false}>
                <p className="text-lg flex justify-center items-center">fees</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">fees</p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.third')}</p>
                <Tooltip text={t('simulator.system.tooltips.third')} />
              </div>
              <SkeletonWrapper isPending={false}>
                <p className="text-lg flex justify-center items-center">fees</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">fees</p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.fourth')}</p>
                <Tooltip text={t('simulator.system.tooltips.fourth')} />
              </div>
              <SkeletonWrapper isPending={false}>
                <p className="text-lg flex justify-center items-center">fees</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">fees</p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.fifth')}</p>
                <Tooltip text={t('simulator.system.tooltips.fifth')} />
              </div>
              <SkeletonWrapper isPending={false}>
                <p className="text-lg flex justify-center items-center">fees</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">fees</p>
              </SkeletonWrapper>
            </div>
            <div className="flex justify-between items-center w-full gap-6">
              <div className="flex flex-row space-x-4">
                <p className="font-medium">{t('simulator.system.labels.sixth')}</p>
                <Tooltip text={t('simulator.system.tooltips.sixth')} />
              </div>
              <SkeletonWrapper isPending={false}>
                <p className="text-lg flex justify-center items-center">fees</p>
                <p className="text-xs text-gray-700 dark:text-gray-400">fees</p>
              </SkeletonWrapper>
            </div>
          </div>
        </div>
        <ShenYieldChart
          shenAmount={shenAmount}
          buyDate={buyDate}
          sellDate={sellDate}
          buyAdaPrice={buyAdaPrice}
          sellAdaPrice={sellAdaPrice}
        />
      </div>
    </div>
  )
}

export default Simulator
