import { Constr, Data, type LucidEvolution, type UTxO } from '@lucid-evolution/lucid'
import { type Network, type Registry } from '@open-djed/registry'
import {
  OrderBurnRedeemer,
  PoolDatum,
  ProcessOrderSpendOrderRedeemer,
  ProcessOrderSpendPoolRedeemer,
  WithdrawRedeemer,
  toBech32,
} from '@open-djed/data'
import type { OrderUTxO, PoolUTxO } from './types'

export const processMintDjedOrder = ({
  lucid,
  registry,
  orderUTxO,
  poolUTxO,
  orderSpendingValidatorRefUTxO,
  orderMintingPolicyRefUTxO,
  poolSpendingValidatorRefUTxO,
  stakeValidatorRefUTxO,
  rewardAddress,
  network,
  now,
}: {
  lucid: LucidEvolution
  registry: Registry
  orderUTxO: OrderUTxO
  poolUTxO: PoolUTxO
  orderSpendingValidatorRefUTxO: UTxO
  orderMintingPolicyRefUTxO: UTxO
  poolSpendingValidatorRefUTxO: UTxO
  stakeValidatorRefUTxO: UTxO
  rewardAddress: string
  network: Network
  now: number
}) => {
  if (!('MintDJED' in orderUTxO.orderDatum.actionFields)) {
    throw new Error()
  }
  const ttl = now + 3 * 60 * 1000 // 3 minutes
  return lucid
    .newTx()
    .validFrom(now)
    .validTo(ttl)
    .readFrom([
      poolSpendingValidatorRefUTxO,
      orderMintingPolicyRefUTxO,
      orderSpendingValidatorRefUTxO,
      stakeValidatorRefUTxO,
    ])
    .collectFrom([poolUTxO], ProcessOrderSpendPoolRedeemer)
    .pay.ToContract(
      registry.poolAddress,
      {
        kind: 'asHash',
        value: Data.to(
          {
            ...poolUTxO.poolDatum,
            adaInReserve:
              poolUTxO.poolDatum.adaInReserve + orderUTxO.orderDatum.actionFields.MintDJED.adaAmount,
            djedInCirculation:
              poolUTxO.poolDatum.djedInCirculation + orderUTxO.orderDatum.actionFields.MintDJED.djedAmount,
            lastOrder: [
              {
                order: {
                  txHash: [orderUTxO.txHash],
                  outputIndex: BigInt(orderUTxO.outputIndex),
                },
                time: orderUTxO.orderDatum.creationDate,
              },
            ],
          },
          PoolDatum,
        ),
      },
      {
        ...poolUTxO.assets,
        [registry.djedAssetId]:
          (poolUTxO.assets[registry.djedAssetId] ?? 0n) -
          orderUTxO.orderDatum.actionFields.MintDJED.djedAmount,
        lovelace: (poolUTxO.assets.lovelace ?? 0n) + orderUTxO.orderDatum.actionFields.MintDJED.adaAmount,
      },
    )
    .collectFrom([orderUTxO], ProcessOrderSpendOrderRedeemer)
    .withdraw(rewardAddress, 0n, WithdrawRedeemer)
    .pay.ToAddressWithData(
      toBech32(orderUTxO.orderDatum.address, network),
      {
        kind: 'inline',
        // NOTE: This is temporary. Need to figure out the actual format of this datum.
        value: Data.to(
          new Constr(0, [
            new Constr(4, [
              orderUTxO.orderDatum.actionFields.MintDJED.adaAmount,
              orderUTxO.orderDatum.actionFields.MintDJED.djedAmount,
            ]),
            new Constr(0, [new Constr(0, [orderUTxO.txHash]), BigInt(orderUTxO.outputIndex)]),
          ]),
        ),
      },
      {
        lovelace: poolUTxO.poolDatum.minADA,
        [registry.djedAssetId]: orderUTxO.orderDatum.actionFields.MintDJED.djedAmount,
      },
    )
    .pay.ToAddressWithData(
      registry.treasuryAddress,
      {
        kind: 'inline',
        value: Data.to(
          new Constr(0, [
            [
              new Constr(0, [new Constr(0, [orderUTxO.txHash]), orderUTxO.orderDatum.creationDate]),
              BigInt(now + 10 * 60 * 1000),
            ],
          ]),
        ),
      },
      {
        lovelace:
          (orderUTxO.assets.lovelace ?? 0n) -
          poolUTxO.poolDatum.minADA -
          orderUTxO.orderDatum.actionFields.MintDJED.adaAmount,
      },
    )
    .addSignerKey(registry.operatorPKH)
    .mintAssets(
      {
        [registry.orderAssetId]: -1n,
      },
      OrderBurnRedeemer,
    )
}
