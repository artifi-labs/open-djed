"use client"

import type { TokenType } from "@open-djed/api"
import { useTranslation } from "react-i18next"

type ActionsProps = {
  token: TokenType
}

export const Actions = ({ token }: ActionsProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col items-center py-8">
      <div className="flex w-full flex-col gap-6 px-4">
        <div className="mb-4 flex flex-col items-center text-center text-xl font-bold">
          <span className="text-5xl">{token}</span>
          <span>{t("actions.title")}</span>
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-6"></div>
      </div>
    </div>
  )
}
