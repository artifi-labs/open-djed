import { useApiClient } from "@/context/ApiClientContext"
import { useToast } from "@/context/ToastContext"
import { useWallet } from "@/context/WalletContext"
import { getWalletData } from "@/lib/getWalletData"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
import { captureEvent } from "@/lib/analytics"
import { AppError } from "@open-djed/api"
import { useTranslations } from "next-intl"

export const useCancelOrder = () => {
  const t = useTranslations()
  const apiClient = useApiClient()
  const { wallet } = useWallet()
  const { showToast } = useToast()

  const cancelOrder = async (orderTx: string, outIndex: number) => {
    const { Transaction, TransactionWitnessSet } =
      await import("@dcspark/cardano-multiplatform-lib-browser")
    if (!wallet) return

    captureEvent("order_cancel_submitted", { orderTx, outIndex })

    try {
      const { address, utxos } = await getWalletData(wallet)
      const response = await apiClient.api["cancel-order"].$post({
        json: {
          hexAddress: address,
          utxosCborHex: utxos,
          txHash: orderTx,
          outIndex,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        captureEvent("order_cancel_failed", {
          orderTx,
          outIndex,
          reason: "app_error",
          error: errorData.error,
          status: response.status,
          message: errorData.message,
        })
        throw new AppError(errorData.message)
      }
      const txCbor = await response.text()
      const txHash = await signAndSubmitTx(
        wallet,
        txCbor,
        Transaction,
        TransactionWitnessSet,
      )
      showToast({ message: t("orders.cancel.success"), type: "success" })
      captureEvent("order_cancel_succeeded", { orderTx, outIndex, txHash })
    } catch (err) {
      console.error("Action failed:", err)
      if (err instanceof AppError) {
        showToast({ message: t("orders.cancel.error"), type: "error" })
        return
      }
      captureEvent("order_cancel_failed", {
        orderTx,
        outIndex,
        reason: "wallet_error",
        code:
          typeof err === "object" && err !== null && "code" in err
            ? err.code
            : undefined,
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return { cancelOrder }
}
