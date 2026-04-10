import { protocolDataApiSchema } from "../../../../../api/src/modules/protocol/protocol.schema"

/**
 * Transform the API schema to convert string fields to their appropriate types (e.g., BigInt, Date)
 */
export const protocolDataSchema = protocolDataApiSchema.transform((entry) => ({
  ...entry,
}))
