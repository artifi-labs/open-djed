import * as Lucid from '@lucid-evolution/lucid'
import {
  type Address,
  type Credential,
  type EvalRedeemer,
  type Script,
  type Transaction,
  type UTxO,
} from '@lucid-evolution/core-types'
import packageJson from '../../cli/package.json' with { type: 'json' }
import { z } from 'zod'
import { CML } from '@lucid-evolution/lucid'

const BlockSchema = z.object({
  slot: z.number(),
})

export const getLatestBlockSlot = ({
  url,
  projectId,
  lucid,
}: {
  url: string
  projectId?: string
  lucid: string
}) =>
  fetch(`${url}/blocks/latest`, {
    headers: {
      ...(projectId ? { project_id: projectId } : {}),
      lucid,
    },
  }).then(async (res) => BlockSchema.parse(await res.json()).slot)

export class Blockfrost extends Lucid.Blockfrost {
  getLatestBlockSlot() {
    return getLatestBlockSlot({ url: this.url, projectId: this.projectId, lucid })
  }

  async evaluateTx(tx: Transaction): Promise<EvalRedeemer[]> {
    const payload = {
      cbor: tx,
      additionalUtxoSet: [],
    }

    const res = await fetch(`${this.url}/utils/txs/evaluate/utxos?version=6`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        project_id: this.projectId,
        lucid,
      },
      body: JSON.stringify(payload),
    }).then((res) => res.json() as { fault?: unknown; status_code?: number; message?: string })
    if (!res || res.fault) {
      const message =
        res.status_code === 400
          ? res.message
          : `Could not evaluate the transaction: ${JSON.stringify(res)}. Transaction: ${tx}`
      throw new Error(message)
    }
    const blockfrostRedeemer = res as BlockfrostRedeemer
    if (!('EvaluationResult' in blockfrostRedeemer.result)) {
      throw new Error(
        `EvaluateTransaction fails: ${JSON.stringify(blockfrostRedeemer.result)} for transaction ${tx}`,
      )
    }
    const evalRedeemers: EvalRedeemer[] = []
    Object.entries(blockfrostRedeemer.result.EvaluationResult).forEach(([redeemerPointer, data]) => {
      const [pTag, pIndex] = redeemerPointer.split(':')
      evalRedeemers.push({
        redeemer_tag: fromLegacyRedeemerTag(pTag as LegacyRedeemerTag),
        redeemer_index: Number(pIndex),
        ex_units: { mem: Number(data.memory), steps: Number(data.steps) },
      })
    })

    return evalRedeemers
  }

  async getMempoolUtxosByAddress(addressOrCredential: Address | Credential): Promise<UTxO[]> {
    const queryPredicate = (() => {
      if (typeof addressOrCredential === 'string') return addressOrCredential
      const credentialBech32 =
        addressOrCredential.type === 'Key'
          ? CML.Ed25519KeyHash.from_hex(addressOrCredential.hash).to_bech32('addr_vkh')
          : CML.ScriptHash.from_hex(addressOrCredential.hash).to_bech32('addr_vkh')
      return credentialBech32
    })()

    // gets every tx_hash registered in the mempool, for a given address
    let mempoolPage = 1
    const mempoolTxs: { tx_hash: string }[] = []

    while (true) {
      const pageResult: { tx_hash: string }[] = await fetch(
        `${this.url}/mempool/addresses/${queryPredicate}?page=${mempoolPage}`,
        { headers: { project_id: this.projectId, lucid } },
      ).then((res) => res.json())

      if (!Array.isArray(pageResult) || pageResult.length === 0) break

      mempoolTxs.push(...pageResult)
      mempoolPage++
    }

    if (mempoolTxs.length === 0) return []

    const result: UTxO[] = []

    for (const { tx_hash } of mempoolTxs) {
      const mempoolTx: BlockfrostMempoolTx = await fetch(`${this.url}/mempool/${tx_hash}`, {
        headers: { project_id: this.projectId, lucid },
      }).then((res) => res.json())

      if (!mempoolTx) continue

      const outputs = mempoolTx.outputs || []

      const filteredOutputs = outputs.map((out) => ({
        txHash: tx_hash,
        outputIndex: out.output_index,
        address: out.address,
        assets: Object.fromEntries(out.amount.map(({ unit: u, quantity }) => [u, BigInt(quantity)])),
        datumHash: (!out.inline_datum && out.data_hash) || undefined,
        datum: out.inline_datum || undefined,
        scriptRef: out.reference_script_hash
          ? ({ type: 'PlutusV3', script: out.reference_script_hash } as Script)
          : null,
      }))

      result.push(...filteredOutputs)
    }

    return result
  }
}

type BlockfrostRedeemer = {
  result:
    | {
        EvaluationResult: {
          [key: string]: {
            memory: number
            steps: number
          }
        }
      }
    | {
        CannotCreateEvaluationContext: unknown
      }
}

type BlockfrostMempoolTx = {
  tx: {
    hash: string
    output_amount: {
      unit: string
      quantity: string
    }[]
    fees: string
    deposit: string
    size: number
    invalid_before: string | null
    invalid_hereafter: string | null
    utxo_count: number
    withdrawal_count: number
    mir_cert_count: number
    delegation_count: number
    stake_cert_count: number
    pool_update_count: number
    pool_retire_count: number
    asset_mint_or_burn_count: number
    redeemer_count: number
    valid_contract: boolean
  }
  inputs: {
    address: string
    tx_hash: string
    output_index: number
    collateral: boolean
    reference: boolean
  }[]
  outputs: {
    address: string
    amount: {
      unit: string
      quantity: string
    }[]
    output_index: number
    data_hash?: string
    inline_datum?: string
    collateral: boolean
    reference_script_hash?: string
  }[]
  redeemers: {
    tx_index: number
    purpose: string
    unit_mem: string
    unit_steps: string
  }[]
}

const lucid = packageJson.version // Lucid version

export type LegacyRedeemerTag = 'spend' | 'mint' | 'certificate' | 'withdrawal'

export const fromLegacyRedeemerTag = (redeemerTag: LegacyRedeemerTag) => {
  switch (redeemerTag) {
    case 'certificate':
      return 'publish'
    case 'withdrawal':
      return 'withdraw'
    default:
      return redeemerTag
  }
}
