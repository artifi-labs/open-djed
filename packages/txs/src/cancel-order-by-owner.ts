import {
  Constr,
  Data,
  type LucidEvolution,
  type UTxO,
} from "@lucid-evolution/lucid"
import { type Network, type Registry } from "@open-djed/registry"
import {
  CancelOrderSpendRedeemer,
  OrderBurnRedeemer,
  toBech32,
} from "@open-djed/data"
import type { OrderUTxO } from "./types"

export const cancelOrderByOwner = ({
  lucid,
  registry,
  orderUTxO,
  orderSpendingValidatorRefUTxO,
  orderMintingPolicyRefUTxO,
  network,
}: {
  lucid: LucidEvolution
  registry: Registry
  orderUTxO: OrderUTxO
  orderSpendingValidatorRefUTxO: UTxO
  orderMintingPolicyRefUTxO: UTxO
  network: Network
}) => {
  const address = toBech32(orderUTxO.orderDatum.address, network)

  return lucid
    .newTx()
    .readFrom([orderSpendingValidatorRefUTxO, orderMintingPolicyRefUTxO])
    .addSigner(address)
    .collectFrom([orderUTxO], CancelOrderSpendRedeemer)
    .pay.ToAddressWithData(
      address,
      {
        kind: "inline",
        // NOTE: This is temporary. Need to figure out the actual format of this datum.
        value: Data.to(
          new Constr(0, [
            new Constr(11, []),
            new Constr(0, [
              new Constr(0, [orderUTxO.txHash]),
              BigInt(orderUTxO.outputIndex),
            ]),
          ]),
        ),
      },
      {},
    )
    .mintAssets(
      {
        [registry.orderAssetId]: -1n,
      },
      OrderBurnRedeemer,
    )
}
