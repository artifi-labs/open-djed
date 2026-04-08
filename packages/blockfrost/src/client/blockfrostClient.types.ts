export type BlockfrostRedeemer = {
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

export type LegacyRedeemerTag = "spend" | "mint" | "certificate" | "withdrawal"
