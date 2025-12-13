import { Database, Logger } from 'minato'

interface Perf {
  id: number
  text: string
  number: number
}

interface Tables {
  perf: Perf
}

function PerformanceTests(database: Database<Tables>) {
  database.extend('perf', {
    id: 'unsigned',
    text: 'text',
    number: 'integer',
  }, {
    autoInc: true,
  })

  before(async () => {
    const driver = Object.values(database.drivers)[0]
    const logger = new Logger(driver.constructor.name)
    logger.level = 2
    await database.upsert('perf', new Array(2000).fill(0).map((_, i) => ({ text: 'hello', number: i })))
  })

  after(async () => {
    const driver = Object.values(database.drivers)[0]
    const logger = new Logger(driver.constructor.name)
    logger.level = 3
  })

  it('stress test', async () => {
    const start = performance.now()
    for (let i = 0; i < 10; i++) {
      await database.get('perf', {})
    }
    const end = performance.now()
    console.log('cost ', end - start)
  })
}

export default PerformanceTests
