'use client'
import { useEffect, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import Modal from '@/components/Modal'
import { TokenDetails } from '@/components/TokenDetails'
import { ReserveDetails } from '@/components/ReserveDetails'

export default function HomePage() {
  const { t } = useTranslation()
  const [hideInfoModal, setHideInfoModal] = useState(false)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    const hasVisitedThisSession = sessionStorage.getItem('hasVisitedHome') === 'true'
    const dontShowAgain = localStorage.getItem('hideInfoModal') === 'true'

    setHideInfoModal(dontShowAgain)

    if (!hasVisitedThisSession && !dontShowAgain) {
      setOpenModal(true)
      sessionStorage.setItem('hasVisitedHome', 'true')
    }
  }, [])

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked
    setHideInfoModal(value)
    localStorage.setItem('hideInfoModal', value.toString())
    if (value) setOpenModal(false)
  }

  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full pt-8 px-4 md:px-8">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-row justify-center items-center gap-2 flex-wrap">
          <h1 className="text-5xl font-bold text-center">OPEN DJED</h1>
          <p className="text-lg text-primary">{t('coin.stablecoin')}</p>
        </div>

        <span onClick={() => setOpenModal(true)} className="text-sm text-primary underline cursor-pointer">
          {t('home.whatIsOpenDjed')}
        </span>
      </div>

      <div className="w-full max-w-5xl flex flex-col rounded-md p-4 md:p-6 items-center gap-6">
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 sm:gap-8 w-full">
          <TokenDetails token="DJED" route="/djed" />
          <TokenDetails token="SHEN" route="/shen" />
        </div>

        <ReserveDetails />
      </div>

      {/* Info Modal */}
      <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title={`Welcome to Open DJED!`}>
        <div className="space-y-4 mt-4 text-lg leading-relaxed p-4">
          <p>
            <Trans i18nKey="home.openDjedDescription" components={{ strong: <strong /> }} />
          </p>

          <p>
            <Trans i18nKey="home.openDjedDevelopment" components={{ strong: <strong /> }} />
          </p>

          <div className="space-y-2">
            <p className="font-semibold">
              <i className="fas fa-magnifying-glass text-primary mr-2"></i>
              {t('home.whyOpenDjed')}
            </p>

            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>
                <i className="fas fa-brain text-primary mr-2"></i>
                <Trans i18nKey="home.openDjedBenefits" components={{ strong: <strong /> }} />
              </li>
              <li>
                <i className="fas fa-wrench text-primary mr-2"></i>
                <Trans i18nKey="home.openDjedFeatures" components={{ strong: <strong /> }} />
              </li>
              <li>
                <i className="fas fa-seedling text-primary mr-2"></i>
                <Trans i18nKey="home.openDjedCommunity" components={{ strong: <strong /> }} />
              </li>
              <li>
                <i className="fas fa-signal text-primary mr-2"></i>
                <Trans i18nKey="home.openDjedAccessibility" components={{ strong: <strong /> }} />
              </li>
              <li>
                <i className="fas fa-earth-americas text-primary mr-2"></i>
                <Trans i18nKey="home.openDjedGlobal" components={{ strong: <strong /> }} />
              </li>
              <li>
                <i className="fas fa-receipt text-primary mr-2"></i>
                <Trans i18nKey="home.openDjedFees" components={{ strong: <strong /> }} />
              </li>
              <li>
                <i className="fas fa-coins text-primary mr-2"></i>
                <Trans i18nKey="home.openDjedOptimizations" components={{ strong: <strong /> }} />
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold">
              <i className="fas fa-compass text-primary mr-2"></i>
              {t('home.ourMission')}
            </p>

            <div className="space-y-4">
              <p>
                <Trans i18nKey="home.openDjedMission" components={{ strong: <strong /> }} />
              </p>

              <p>
                <Trans i18nKey="home.openDjedVision" components={{ strong: <strong /> }} />
              </p>
            </div>
          </div>

          <p className="font-bold">{t('home.joinUs')}</p>

          <div className="flex justify-end items-center mt-4">
            <input
              type="checkbox"
              id="hideInfoModal"
              className="mr-2"
              checked={hideInfoModal}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="hideInfoModal" className="text-sm">
              {t('home.dontShowAgain')}
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
