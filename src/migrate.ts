// noinspection ES6PreferShortImport

import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { PgMigrator } from '@effect/sql-pg'
import { Effect } from 'effect'
import { fileURLToPath } from 'node:url'
import { DatabaseLive } from './lib/server/database'

const program = PgMigrator.run({
  loader: PgMigrator.fromFileSystem(fileURLToPath(new URL('migrations', import.meta.url)))
}).pipe(
  Effect.tap((results) =>
    results.length === 0 ? Effect.log('No pending migrations') : Effect.log(`Applied ${results.length} migration(s)`)
  )
)

program.pipe(Effect.provide(DatabaseLive), Effect.provide(NodeContext.layer), NodeRuntime.runMain)
