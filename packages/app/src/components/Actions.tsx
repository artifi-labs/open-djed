"use client"

import { useState } from "react"
import { Action } from "./Action"
import type { TokenType } from "@open-djed/api"
import { useTranslation } from "react-i18next"
import { ACTIONS } from "@/lib/constants"

type ActionsProps = {
  token: TokenType
}

export const Actions = ({ token }: ActionsProps) => {
  const { t } = useTranslation()

  const [isActionPending, setIsActionPending] = useState(false)

  const handleActionStart = () => {
    setIsActionPending(true)
  }

  const handleActionComplete = () => {
    setIsActionPending(false)
  }

  return (
    <div className="flex w-full flex-col items-center py-8">
      <div className="flex w-full flex-col gap-6 px-4">
        <div className="mb-4 flex flex-col items-center text-center text-xl font-bold">
          <span className="text-5xl">{token}</span>
          <span>{t("actions.title")}</span>
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-6">
          {ACTIONS.map((action) => (
            <div key={action} className="w-full md:flex-1">
              <Action
                key={action}
                action={action}
                token={token}
                onActionStart={handleActionStart}
                onActionComplete={handleActionComplete}
              />
            </div>
          ))}
        </div>

        {/* Loading state or other statuses */}
        {isActionPending && (
          <div className="mt-4 text-center text-lg">
            {t("actions.processingAction")}...
          </div>
        )}
      </div>
    </div>
  )
}
