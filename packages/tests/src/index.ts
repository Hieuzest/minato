import { Database } from 'minato'
import ModelOperations from './model'
import QueryOperators from './query'
import UpdateOperators from './update'
import ObjectOperations from './object'
import Migration from './migration'
import Selection from './selection'
import Json from './json'
import Transaction from './transaction'
import Relation from './relation'
import Performance from './performance'
import './setup'

export { expect } from 'chai'

const Keywords = ['name']
type Keywords = 'name'

type UnitOptions<T> = (T extends (database: Database, options?: infer R) => any ? R : {}) & {
  [K in keyof T as Exclude<K, Keywords>]?: false | UnitOptions<T[K]>
}

type OverrideUnitOptions<T> = (T extends (database: Database, options?: infer R) => any ? R : {}) & {
  [K in keyof T as Exclude<K, Keywords>]?: boolean | UnitOptions<T[K]>
}

type Unit<T> = ((database: Database, options?: UnitOptions<T>, overrideOptions?: OverrideUnitOptions<T>) => void) & {
  [K in keyof T as Exclude<K, Keywords>]: Unit<T[K]>
}

function setValue(obj: any, path: string, value: any) {
  if (path.includes('.')) {
    const index = path.indexOf('.')
    setValue(obj[path.slice(0, index)] ??= {}, path.slice(index + 1), value)
  } else {
    obj[path] = value
  }
}

function createUnit<T>(target: T, root = false): Unit<T> {
  const test: any = (database: Database, options: any = {}, overrideOptions?: any) => {
    function callback() {
      if (typeof target === 'function') {
        target(database, options)
      }

      for (const key in target) {
        if (overrideOptions && !overrideOptions[key]) continue
        if (options[key] === false || Keywords.includes(key)) continue
        test[key](database, options[key], overrideOptions?.[key] === true ? undefined : overrideOptions?.[key])
      }
    }

    if (root) {
      process.argv.filter(x => x.startsWith('--+')).forEach(x => setValue(options, x.slice(3), true))
      process.argv.filter(x => x.startsWith('---')).forEach(x => setValue(options, x.slice(3), false))
      if (process.argv.some(x => x.startsWith('--!'))) {
        overrideOptions = {}
        process.argv.filter(x => x.startsWith('--!')).forEach(x => setValue(overrideOptions, x.slice(3), true))
      }
    }

    const title = target['name']
    if (!root && title) {
      describe(title.replace(/(?=[A-Z])/g, ' ').trimStart(), callback)
    } else {
      callback()
    }
  }

  for (const key in target) {
    if (Keywords.includes(key)) continue
    test[key] = createUnit(target[key])
  }

  return test
}

namespace Tests {
  export const model = ModelOperations
  export const query = QueryOperators
  export const update = UpdateOperators
  export const object = ObjectOperations
  export const selection = Selection
  export const migration = Migration
  export const json = Json
  export const transaction = Transaction
  export const relation = Relation
  export const performance = Performance
}

export default createUnit(Tests, true)
