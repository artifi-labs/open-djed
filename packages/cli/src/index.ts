import {
  Data,
  Lucid,
  getAddressDetails,
  slotToUnixTime,
  type UTxO,
} from "@lucid-evolution/lucid"
import { program } from "commander"
import {
  createMintDjedOrder,
  createBurnShenOrder,
  createBurnDjedOrder,
  createMintShenOrder,
  cancelOrderByOwner,
} from "@open-djed/txs"
import { registryByNetwork } from "@open-djed/registry"
import { Blockfrost } from "@open-djed/blockfrost"
import { env } from "./env"
import { parseOutRef } from "@open-djed/txs"
import { OracleDatum, OrderDatum, PoolDatum } from "@open-djed/data"
import {
  djedADABurnRate,
  djedADAMintRate,
  maxBurnableSHEN,
  maxMintableDJED,
  maxMintableSHEN,
  reserveRatio,
  shenADABurnRate,
  shenADAMintRate,
} from "@open-djed/math"
import { processMintDjedOrder } from "@open-djed/txs/src/process-mint-djed-order"

console.log(
  `Initializing Lucid with Blockfrost for network "${env.NETWORK}" using project id "${env.BLOCKFROST_PROJECT_ID.slice(8)}...".`,
)

const blockfrost = new Blockfrost(env.BLOCKFROST_URL, env.BLOCKFROST_PROJECT_ID)

const lucid = await Lucid(blockfrost, env.NETWORK)
console.log("Finished initializing Lucid.")
const registry = registryByNetwork[env.NETWORK]

if (env.SEED) {
  lucid.selectWallet.fromSeed(env.SEED)
} else if (env.ADDRESS) {
  lucid.selectWallet.fromAddress(env.ADDRESS, await lucid.utxosAt(env.ADDRESS))
}

const rawPoolUTxO = (
  await lucid.utxosAtWithUnit(registry.poolAddress, registry.poolAssetId)
)[0]
if (!rawPoolUTxO) throw new Error(`Couldn't find pool utxo.`)
const poolDatumHex = Data.to(await lucid.datumOf(rawPoolUTxO))
const poolUTxO = {
  ...rawPoolUTxO,
  poolDatum: Data.from(poolDatumHex, PoolDatum),
}
const rawOracleUTxO = (
  await lucid.utxosAtWithUnit(registry.oracleAddress, registry.oracleAssetId)
)[0]
if (!rawOracleUTxO) throw new Error(`Couldn't find oracle utxo.`)
const oracleUTxO = {
  ...rawOracleUTxO,
  oracleDatum: Data.from(
    Data.to(await lucid.datumOf(rawOracleUTxO)),
    OracleDatum,
  ),
}

const now = slotToUnixTime(env.NETWORK, await blockfrost.getLatestBlockSlot())

const { orderMintingPolicyRefUTxO, orderSpendingValidatorRefUTxO } = registry

program
  .command("create-mint-djed-order")
  .argument("<amount>", "Amount of DJED to mint")
  .option("--sign", "Sign the transaction")
  .option("--submit", "Submit the transaction")
  .action(async (amount, options) => {
    const tx = createMintDjedOrder({
      lucid,
      registry,
      amount: BigInt(amount),
      address: await lucid.wallet().address(),
      poolUTxO,
      oracleUTxO,
      orderMintingPolicyRefUTxO,
      now,
    })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (
      options.sign ? balancedTx.sign.withWallet() : balancedTx
    ).complete()
    console.log("Transaction CBOR")
    console.log(signedTx.toCBOR())
    console.log("Transaction hash")
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log("Transaction submitted")
    }
  })

program
  .command("create-burn-djed-order")
  .argument("<amount>", "Amount of DJED to mint")
  .option("--sign", "Sign the transaction")
  .option("--submit", "Submit the transaction")
  .action(async (amount, options) => {
    const tx = createBurnDjedOrder({
      lucid,
      registry,
      amount: BigInt(amount),
      address: await lucid.wallet().address(),
      poolUTxO,
      oracleUTxO,
      orderMintingPolicyRefUTxO,
      now,
    })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (
      options.sign ? balancedTx.sign.withWallet() : balancedTx
    ).complete()
    console.log("Transaction CBOR")
    console.log(signedTx.toCBOR())
    console.log("Transaction hash")
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log("Transaction submitted")
    }
  })

program
  .command("create-mint-shen-order")
  .argument("<amount>", "Amount of SHEN to mint")
  .option("--sign", "Sign the transaction")
  .option("--submit", "Submit the transaction")
  .action(async (amount, options) => {
    const tx = createMintShenOrder({
      lucid,
      registry,
      amount: BigInt(amount),
      address: await lucid.wallet().address(),
      poolUTxO,
      oracleUTxO,
      orderMintingPolicyRefUTxO,
      now,
    })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (
      options.sign ? balancedTx.sign.withWallet() : balancedTx
    ).complete()
    console.log("Transaction CBOR")
    console.log(signedTx.toCBOR())
    console.log("Transaction hash")
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log("Transaction submitted")
    }
  })

program
  .command("create-burn-shen-order")
  .argument("<amount>", "Amount of DJED to mint")
  .option("--sign", "Sign the transaction")
  .option("--submit", "Submit the transaction")
  .action(async (amount, options) => {
    const tx = createBurnShenOrder({
      lucid,
      registry,
      amount: BigInt(amount),
      address: await lucid.wallet().address(),
      poolUTxO,
      oracleUTxO,
      orderMintingPolicyRefUTxO,
      now,
    })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (
      options.sign ? balancedTx.sign.withWallet() : balancedTx
    ).complete()
    console.log("Transaction CBOR")
    console.log(signedTx.toCBOR())
    console.log("Transaction hash")
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log("Transaction submitted")
    }
  })

program
  .command("cancel-order")
  .argument("<out-ref>", "The output reference of the order")
  .option("--sign", "Sign the transaction")
  .option("--submit", "Submit the transaction")
  .action(async (outRef, options) => {
    const rawOrderUTxO = (await lucid.utxosByOutRef([parseOutRef(outRef)]))[0]
    if (!rawOrderUTxO)
      throw new Error(`Couldn't find order utxo for outRef: ${outRef}`)
    if (!Object.keys(rawOrderUTxO.assets).includes(registry.orderAssetId))
      throw new Error(`Utxo for outRef ${outRef} isn't order utxo.`)
    const orderUTxO = {
      ...rawOrderUTxO,
      orderDatum: Data.from(
        Data.to(await lucid.datumOf(rawOrderUTxO)),
        OrderDatum,
      ),
    }
    const tx = cancelOrderByOwner({
      network: env.NETWORK,
      lucid,
      registry,
      orderUTxO,
      orderMintingPolicyRefUTxO,
      orderSpendingValidatorRefUTxO,
    })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (
      options.sign ? balancedTx.sign.withWallet() : balancedTx
    ).complete()
    console.log("Transaction CBOR")
    console.log(signedTx.toCBOR())
    console.log("Transaction hash")
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log("Transaction submitted")
    }
  })

program
  .command("process-mint-djed-order")
  .argument("<out-ref>", "The output reference of the order")
  .option("--sign", "Sign the transaction")
  .option("--submit", "Submit the transaction")
  .action(async (outRef, options) => {
    const rawOrderUTxO = (await lucid.utxosByOutRef([parseOutRef(outRef)]))[0]
    if (!rawOrderUTxO)
      throw new Error(`Couldn't find order utxo for outRef: ${outRef}`)
    if (!Object.keys(rawOrderUTxO.assets).includes(registry.orderAssetId))
      throw new Error(`Utxo for outRef ${outRef} isn't order utxo.`)
    const orderUTxO = {
      ...rawOrderUTxO,
      orderDatum: Data.from(
        Data.to(await lucid.datumOf(rawOrderUTxO)),
        OrderDatum,
      ),
    }
    const tx = processMintDjedOrder({
      network: env.NETWORK,
      lucid,
      registry,
      orderUTxO,
      poolUTxO,
      orderMintingPolicyRefUTxO,
      orderSpendingValidatorRefUTxO,
      now,
      poolSpendingValidatorRefUTxO: registry.poolSpendingValidatorRefUTxO,
      stakeValidatorRefUTxO: registry.stakeValidatorRefUTxO,
      rewardAddress: registry.rewardAddress,
    })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (
      options.sign ? balancedTx.sign.withWallet() : balancedTx
    ).complete()
    console.log("Transaction CBOR")
    console.log(signedTx.toCBOR())
    console.log("Transaction hash")
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log("Transaction submitted")
    }
  })

program.command("protocol-data").action(async () => {
  const oracleUtxo = await lucid.utxoByUnit(registry.oracleAssetId)
  const oracleInlineDatum = oracleUtxo.datum
  if (!oracleInlineDatum) throw new Error("Couldn't get oracle inline datum.")
  const oracleDatum = Data.from(oracleInlineDatum, OracleDatum)
  const poolUtxo = await lucid.utxoByUnit(registry.poolAssetId)
  const poolDatumCbor = poolUtxo.datum ?? Data.to(await lucid.datumOf(poolUtxo))
  const poolDatum = Data.from(poolDatumCbor, PoolDatum)
  console.log(
    JSON.stringify(
      {
        djed: {
          buyPrice: djedADAMintRate(
            oracleDatum,
            registry.MintDJEDFeePercentage,
          ).toNumber(),
          sellPrice: djedADABurnRate(
            oracleDatum,
            registry.BurnDJEDFeePercentage,
          ).toNumber(),
          circulatingSupply: Number(poolDatum.djedInCirculation) / 1e6,
          mintableAmount:
            Number(
              maxMintableDJED(
                poolDatum,
                oracleDatum,
                registry.MintDJEDFeePercentage,
              ),
            ) / 1e6,
          burnableAmount: Number.POSITIVE_INFINITY,
        },
        shen: {
          buyPrice: shenADAMintRate(
            poolDatum,
            oracleDatum,
            registry.MintSHENFeePercentage,
          ).toNumber(),
          sellPrice: shenADABurnRate(
            poolDatum,
            oracleDatum,
            registry.BurnSHENFeePercentage,
          ).toNumber(),
          circulatingSupply: Number(poolDatum.shenInCirculation) / 1e6,
          mintableAmount:
            Number(
              maxMintableSHEN(
                poolDatum,
                oracleDatum,
                registry.MintSHENFeePercentage,
              ),
            ) / 1e6,
          burnableAmount:
            Number(
              maxBurnableSHEN(
                poolDatum,
                oracleDatum,
                registry.BurnSHENFeePercentage,
              ),
            ) / 1e6,
        },
        reserve: {
          amount: Number(poolDatum.adaInReserve) / 1e6,
          ratio: reserveRatio(poolDatum, oracleDatum).toNumber(),
        },
      },
      undefined,
      2,
    ),
  )
})

program.command("orders").action(async () => {
  const orderUtxos = await lucid.utxosAtWithUnit(
    registry.orderAddress,
    registry.orderAssetId,
  )
  type OrderUTxO = UTxO & { orderDatum: OrderDatum }
  const orderUtxosWithDatum: OrderUTxO[] = await Promise.all(
    orderUtxos.map(async (o) => {
      try {
        return {
          ...o,
          orderDatum: Data.from(Data.to(await lucid.datumOf(o)), OrderDatum),
        }
      } catch (e) {
        console.warn(
          `Couldn't decode datum for order utxo ${o.txHash}#${o.outputIndex} with error ${e}`,
        )
        return undefined
      }
    }),
  ).then((orderUtxos) => orderUtxos.filter((o): o is OrderUTxO => Boolean(o)))
  const addressDetails = getAddressDetails(await lucid.wallet().address())
  const myOrderUtxos = orderUtxosWithDatum.filter(
    (o) =>
      o.orderDatum.address.paymentKeyHash[0] ===
        addressDetails.paymentCredential?.hash &&
      o.orderDatum.address.stakeKeyHash[0][0][0] ===
        addressDetails.stakeCredential?.hash,
  )
  // TODO: Need to query Blockfrost for previous orders in order to capture those that have been fulfilled or cancelled.
  console.log(
    JSON.stringify(
      myOrderUtxos.map((o) => ({
        // TODO: Need to query Blockfrost for datetime instead of setting `date` to `null` here.
        date: null,
        txHash: o.txHash,
        status: "Pending",
        ...("MintDJED" in o.orderDatum.actionFields
          ? {
              action: "Mint",
              amount: `${o.orderDatum.actionFields.MintDJED.djedAmount} DJED`,
            }
          : "BurnDJED" in o.orderDatum.actionFields
            ? {
                action: "Burn",
                amount: `${o.orderDatum.actionFields.BurnDJED.djedAmount} DJED`,
              }
            : "MintSHEN" in o.orderDatum.actionFields
              ? {
                  action: "Mint",
                  amount: `${o.orderDatum.actionFields.MintSHEN.shenAmount} SHEN`,
                }
              : "BurnSHEN" in o.orderDatum.actionFields
                ? {
                    action: "Burn",
                    amount: `${o.orderDatum.actionFields.BurnSHEN.shenAmount} SHEN`,
                  }
                : {}),
      })),
      undefined,
      2,
    ),
  )
})

await program.parseAsync()
