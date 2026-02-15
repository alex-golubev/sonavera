// noinspection ES6PreferShortImport

import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { PgClient, PgMigrator } from '@effect/sql-pg'
import { Config, Effect, Redacted } from 'effect'
import { fileURLToPath } from 'node:url'

const normalizeSslMode = (url: string): string => url.replace(/sslmode=require(?!-)/, 'sslmode=verify-full')

const DatabaseLive = PgClient.layerConfig({
  url: Config.map(Config.redacted('DATABASE_URL'), (r) => Redacted.make(normalizeSslMode(Redacted.value(r))))
})

const program = PgMigrator.run({
  loader: PgMigrator.fromFileSystem(fileURLToPath(new URL('migrations', import.meta.url)))
}).pipe(
  Effect.tap((results) =>
    results.length === 0 ? Effect.log('No pending migrations') : Effect.log(`Applied ${results.length} migration(s)`)
  )
)

program.pipe(Effect.provide(DatabaseLive), Effect.provide(NodeContext.layer), NodeRuntime.runMain)
