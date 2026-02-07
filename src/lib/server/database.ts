import { PgClient } from '@effect/sql-pg'
import { Config } from 'effect'

export const DatabaseLive = PgClient.layerConfig({
  url: Config.redacted('DATABASE_URL'),
  maxConnections: Config.succeed(5),
  idleTimeout: Config.succeed('30 seconds'),
  connectTimeout: Config.succeed('10 seconds')
})
