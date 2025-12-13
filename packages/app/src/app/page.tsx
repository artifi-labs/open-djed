"use client"
import { useEffect, useState } from "react"
import { useTranslation, Trans } from "react-i18next"
import Modal from "@/components/Modal"
import { TokenDetails } from "@/components/TokenDetails"
import { ReserveDetails } from "@/components/ReserveDetails"

export default function HomePage() {
  const { t } = useTranslation()
  const [hideInfoModal, setHideInfoModal] = useState(false)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    const hasVisitedThisSession =
      sessionStorage.getItem("hasVisitedHome") === "true"
    const dontShowAgain = localStorage.getItem("hideInfoModal") === "true"

    setHideInfoModal(dontShowAgain)

    if (!hasVisitedThisSession && !dontShowAgain) {
      setOpenModal(true)
      sessionStorage.setItem("hasVisitedHome", "true")
    }
  }, [])

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked
    setHideInfoModal(value)
    localStorage.setItem("hideInfoModal", value.toString())
    if (value) setOpenModal(false)
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 px-4 pt-8 md:px-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-row flex-wrap items-center justify-center gap-2">
          <h1 className="text-center text-5xl font-bold">OPEN DJED</h1>
          <p className="text-primary text-lg">{t("coin.stablecoin")}</p>
        </div>

        <span
          onClick={() => setOpenModal(true)}
          className="text-primary cursor-pointer text-sm underline"
        >
          {t("home.whatIsOpenDjed")}
        </span>
      </div>

      <div className="flex w-full max-w-5xl flex-col items-center gap-6 rounded-md p-4 md:p-6">
        <div className="flex w-full flex-col items-stretch justify-center gap-6 sm:gap-8 md:flex-row">
          <TokenDetails token="DJED" route="/djed" />
          <TokenDetails token="SHEN" route="/shen" />
        </div>

        <ReserveDetails />
      </div>

      {/* Info Modal */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title={`Welcome to Open DJED!`}
      >
        <div className="mt-4 space-y-4 p-4 text-lg leading-relaxed">
          <p>
            <Trans
              i18nKey="home.openDjedDescription"
              components={{ strong: <strong /> }}
            />
          </p>

          <p>
            <Trans
              i18nKey="home.openDjedDevelopment"
              components={{ strong: <strong /> }}
            />
          </p>

          <div className="space-y-2">
            <p className="font-semibold">
              <i className="fas fa-magnifying-glass text-primary mr-2"></i>
              {t("home.whyOpenDjed")}
            </p>

            <ul className="list-inside list-disc space-y-1 pl-2">
              <li>
                <i className="fas fa-brain text-primary mr-2"></i>
                <Trans
                  i18nKey="home.openDjedBenefits"
                  components={{ strong: <strong /> }}
                />
              </li>
              <li>
                <i className="fas fa-wrench text-primary mr-2"></i>
                <Trans
                  i18nKey="home.openDjedFeatures"
                  components={{ strong: <strong /> }}
                />
              </li>
              <li>
                <i className="fas fa-seedling text-primary mr-2"></i>
                <Trans
                  i18nKey="home.openDjedCommunity"
                  components={{ strong: <strong /> }}
                />
              </li>
              <li>
                <i className="fas fa-signal text-primary mr-2"></i>
                <Trans
                  i18nKey="home.openDjedAccessibility"
                  components={{ strong: <strong /> }}
                />
              </li>
              <li>
                <i className="fas fa-earth-americas text-primary mr-2"></i>
                <Trans
                  i18nKey="home.openDjedGlobal"
                  components={{ strong: <strong /> }}
                />
              </li>
              <li>
                <i className="fas fa-receipt text-primary mr-2"></i>
                <Trans
                  i18nKey="home.openDjedFees"
                  components={{ strong: <strong /> }}
                />
              </li>
              <li>
                <i className="fas fa-coins text-primary mr-2"></i>
                <Trans
                  i18nKey="home.openDjedOptimizations"
                  components={{ strong: <strong /> }}
                />
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold">
              <i className="fas fa-compass text-primary mr-2"></i>
              {t("home.ourMission")}
            </p>

            <div className="space-y-4">
              <p>
                <Trans
                  i18nKey="home.openDjedMission"
                  components={{ strong: <strong /> }}
                />
              </p>

              <p>
                <Trans
                  i18nKey="home.openDjedVision"
                  components={{ strong: <strong /> }}
                />
              </p>
            </div>
          </div>

          <p className="font-bold">{t("home.joinUs")}</p>

          <div className="mt-4 flex items-center justify-end">
            <input
              type="checkbox"
              id="hideInfoModal"
              className="mr-2"
              checked={hideInfoModal}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="hideInfoModal" className="text-sm">
              {t("home.dontShowAgain")}
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
