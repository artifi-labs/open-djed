import type { AddressTransaction } from "@open-djed/blockfrost/src/types/address/addressTransaction"
import { blockfrost } from "../../../.."
import type { TransactionUtxo } from "@open-djed/blockfrost/src/types/transaction/transactionUtxo"
import { type TokenClass } from "../../../../tokens"
import { Dex } from "../../../../../generated/prisma/enums"


export type PoolTokenAmount = {
  token: TokenClass
  adaAmount: number
  tokenAmount: number
}

export abstract class DexProvider {
  
  protected abstract name: Dex
  protected abstract address: string

  getName(): Dex {
    return this.name
  }

  getAddress(): string {
    return this.address
  }

  getPoolAmountFromUtxo(transactionUtxos: TransactionUtxo, token: TokenClass): PoolTokenAmount | undefined {
    if (!transactionUtxos)
      throw new Error("Transaction UTxOs are required to get token value from UTxO")

    const poolOutputs = transactionUtxos.outputs.filter(
      (output) => output.address === this.address,
    )

    if (poolOutputs.length === 0) return

    for (const output of poolOutputs) {
      let tokenAAmount = 0
      let tokenBAmount = 0

      for (const amount of output.amount) {
        // TODO: REPLACE THIS TO FIND THE TOKEN AMOUNT IN A MORE RELIABLE WAY.
        if(amount.unit === "lovelace" && Number(amount.quantity) > 100_000_000) {
          tokenAAmount = Number(amount.quantity)
        } else if (amount.unit.startsWith(token.policyId)){
          tokenBAmount = Number(amount.quantity)
        }
      } 

      if (tokenAAmount === 0 || tokenBAmount === 0) continue

      return {
        token: token,
        adaAmount: tokenAAmount,
        tokenAmount: tokenBAmount,
      }
    }

    return undefined
  }

  async getAddressTransactions(): Promise<AddressTransaction[]> {
    const request = await blockfrost
      .getAddressTransactions({ address: this.address, order: "asc"})
      .allPages({maxPages: 100, count: 100}) // TODO: REMOVE THIS LIMITATIONS
      .retry()
    
    return request
  }

  async getTransactionUtxOs(transaction: AddressTransaction): Promise<TransactionUtxo> {
    const txUtxOs = await blockfrost.getTransactionUTxOs({ hash: transaction.tx_hash })
      .retry()

    return txUtxOs
  }
}

export class MinswapProvider extends DexProvider {
  protected name = Dex.Minswap
  protected address = "addr1z84q0denmyep98ph3tmzwsmw0j7zau9ljmsqx6a4rvaau66j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq777e2a" // TODO: THIS NEEDS TO BE IN A CONFIG TO SUPPORT NETWORKS
}

export class WingridersProvider extends DexProvider {
  protected name = Dex.WingRiders
  protected address = "addr1zxhew7fmsup08qvhdnkg8ccra88pw7q5trrncja3dlszhq6d77rk0jjxny493quf2pv32xup2ucx6hp6enfjg8gnjq0qqzlqam"
}

