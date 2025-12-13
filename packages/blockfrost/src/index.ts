import * as Lucid from '@lucid-evolution/lucid'
import { type EvalRedeemer, type Transaction } from '@lucid-evolution/lucid'
import packageJson from '../../cli/package.json' with { type: 'json' }
import { z } from 'zod'

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
