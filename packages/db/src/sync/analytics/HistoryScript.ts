import { logger } from "../../utils/logger"
import type { PopulateContext, UpdateContext } from "./context/context"

export abstract class HistoryScript {
  protected abstract populate(ctx: PopulateContext): Promise<void>
  
  protected abstract update(ctx: UpdateContext): Promise<void>

  protected abstract prismaModel: {
    findFirst(args: unknown): Promise<{ timestamp: Date } | null>
    count(): Promise<number>
  }

  rollback?(): Promise<void> | void

  protected async countRecords(): Promise<number> {
    return this.prismaModel.count()
  }

  async latestTimestamp(): Promise<Date | undefined> {
    const latest = await this.prismaModel.findFirst({
      orderBy: { timestamp: "desc" },
    })
    return latest?.timestamp
  }

  async needAction(): Promise<{ needPopulate: boolean; needUpdate: boolean }> {
    const count = await this.countRecords()
    const needPopulate = await this.needPopulate(count)
    const needUpdate = await this.needUpdate(count)

    return { needPopulate, needUpdate }
  }

  async runner(
    populateContext?: PopulateContext,
    updateContext?: UpdateContext,
    action?: { needPopulate: boolean; needUpdate: boolean }
  ): Promise<void> {
    const needPopulate = action?.needPopulate ?? await this.needPopulate()
    const needUpdate = action?.needUpdate ?? await this.needUpdate()

    if (!needPopulate && !needUpdate) {
      logger.info(`No update needed for ${this.constructor.name}. Skipping.`)
      return
    }

    if (needPopulate) {
      if (!populateContext)
        throw new Error(`${this.constructor.name} requires a populate context, but none was provided.`)

      return await this.populate(populateContext)
    }

    if (!updateContext)
      throw new Error(`${this.constructor.name} requires an update context, but none was provided.`)

    return await this.update(updateContext)
  }

  async needPopulate(count?: number): Promise<boolean> {
    let empty = false
  
    if (!count) {
      empty = await this.countRecords() === 0
    } else {
      empty = count === 0
    }

    return empty
  }

  async needUpdate(count?: number): Promise<boolean> {
    const daysAgo = 1
    const needPopulate = await this.needPopulate(count)
    if (needPopulate) return false
    
    const latest = await this.latestTimestamp()
    if (!latest)
      throw new Error(`Failed to retrieve latest timestamp for ${this.constructor.name}. Cannot determine if update is needed.`)
  
    const now = new Date()
    const referenceDay = new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo).setHours(0, 0, 0, 0))

    if (latest < referenceDay) return true

    return false
  }

}