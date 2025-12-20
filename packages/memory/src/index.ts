import { SQLiteDriver } from '@minatojs/driver-node-sqlite'
import { Context } from 'cordis'
import { Driver, z } from 'minato'

export type MemoryDriver = Driver & {
  new (ctx: Context): MemoryDriver
  name: string
  // Config: {}
}

// @ts-ignore
export const MemoryDriver: MemoryDriver = class MemoryDriver extends SQLiteDriver {
  static name = 'memory'
  static Config = z.object({})

  constructor(ctx: any) {
    super(ctx, { path: ':memory:' })
  }
}

export default MemoryDriver
