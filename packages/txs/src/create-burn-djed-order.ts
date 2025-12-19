import {
  Data,
  fromUnit,
  type LucidEvolution,
  type UTxO,
} from "@lucid-evolution/lucid"
import { type Registry } from "@open-djed/registry"
import {
  OrderDatum,
  OrderMintRedeemer,
  PoolDatum,
  fromBech32,
} from "@open-djed/data"
import { djedADABurnRate, operatorFee } from "@open-djed/math"
import type { OracleUTxO, PoolUTxO } from "./types"

export const createBurnDjedOrder = ({
  lucid,
  registry,
  amount,
  address,
  oracleUTxO,
  poolUTxO,
  orderMintingPolicyRefUTxO,
  now,
}: {
  lucid: LucidEvolution
  registry: Registry
  amount: bigint
  address: string
  oracleUTxO: OracleUTxO
  poolUTxO: PoolUTxO
  orderMintingPolicyRefUTxO: UTxO
  now: number
}) => {
  const ttl = now + 3 * 60 * 1000 // 3 minutes

  return lucid
    .newTx()
    .readFrom([oracleUTxO, poolUTxO, orderMintingPolicyRefUTxO])
    .validFrom(now)
    .validTo(ttl)
    .addSigner(address)
    .pay.ToContract(
      registry.orderAddress,
      {
        kind: "inline",
        value: Data.to(
          {
            actionFields: {
              BurnDJED: {
                djedAmount: amount,
              },
            },
            address: fromBech32(address),
            adaUSDExchangeRate:
              oracleUTxO.oracleDatum.oracleFields.adaUSDExchangeRate,
            creationDate: BigInt(ttl),
            orderStateTokenMintingPolicyId: fromUnit(registry.orderAssetId)
              .policyId,
          },
          OrderDatum,
        ),
      },
      {
        [registry.orderAssetId]: 1n,
        lovelace:
          poolUTxO.poolDatum.minADA +
          operatorFee(
            djedADABurnRate(
              oracleUTxO.oracleDatum,
              registry.BurnDJEDFeePercentage,
            ).mul(amount),
            registry.operatorFeeConfig,
          ),
        [registry.djedAssetId]: amount,
      },
    )
    .mintAssets(
      {
        [registry.orderAssetId]: 1n,
      },
      OrderMintRedeemer,
    )
    .pay.ToAddressWithData(
      address,
      { kind: "asHash", value: Data.to(poolUTxO.poolDatum, PoolDatum) },
      {},
    )
}
