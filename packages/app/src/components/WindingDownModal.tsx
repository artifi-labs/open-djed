"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import Modal from "@/components/modals/Modal"

const WHAT_THIS_MEANS_KEYS = [
  "closingDate",
  "openDjedImpact",
  "readOnly",
  "planAhead",
] as const

const WindingDownModal = () => {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  return (
    <Modal
      title={t("windingDown.modal.title")}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="desktop:p-42 p-32"
      paddingClassName="p-0"
      titleClassName="pb-16"
    >
      <div className="text-secondary flex flex-col gap-16 text-sm">
        <p className="text-sm">{t("windingDown.modal.description")}</p>

        <div className="flex flex-col gap-12">
          <h3 className="text-primary text-xl font-medium">
            {t("windingDown.modal.whatThisMeans.title")}
          </h3>
          <ul className="ml-3 flex list-disc flex-col pl-3">
            {WHAT_THIS_MEANS_KEYS.map((key) => (
              <li key={key}>
                {t.rich(`windingDown.modal.whatThisMeans.items.${key}`, {
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default WindingDownModal
