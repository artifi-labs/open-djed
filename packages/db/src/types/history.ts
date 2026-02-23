import type { ExtraContexts, PopulateContext, UpdateContext } from "../sync/sharedContext"

export interface InterfaceHistoryScript {
  needUpdate?(): Promise<boolean>
  latestTimestamp(): Promise<Date | undefined>
  runner(populateContext?: PopulateContext, updateContext?: UpdateContext): Promise<void>
  requires?: readonly (keyof ExtraContexts)[]
  rollback?(): Promise<void> | void
  populate(ctx: PopulateContext): Promise<void>
  update(ctx: UpdateContext): Promise<void>
}