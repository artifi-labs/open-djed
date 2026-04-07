import { useApiClient } from "@/context/ApiClientContext"
import { useToast } from "@/context/ToastContext"
import { useWallet } from "@/context/WalletContext"
import { getWalletData } from "@/lib/getWalletData"
import { signAndSubmitTx } from "@/lib/signAndSubmitTx"
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
        throw new AppError(errorData.message)
      }
      const txCbor = await response.text()
      await signAndSubmitTx(wallet, txCbor, Transaction, TransactionWitnessSet)
      showToast({ message: t("orders.cancel.success"), type: "success" })
    } catch (err) {
      console.error("Action failed:", err)
      if (err instanceof AppError) {
        showToast({ message: t("orders.cancel.error"), type: "error" })
      }
    }
  }

  return { cancelOrder }
}
