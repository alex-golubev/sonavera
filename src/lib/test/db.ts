import { PgClient, PgMigrator } from '@effect/sql-pg'
import { SqlClient } from '@effect/sql'
import { NodeContext } from '@effect/platform-node'
import { Effect, Redacted } from 'effect'
import { fileURLToPath } from 'node:url'

const snakeToCamel = (s: string): string => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
const camelToSnake = (s: string): string => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)

export const TestDatabaseLive = PgClient.layer({
  url: Redacted.make(process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/local'),
  transformResultNames: snakeToCamel,
  transformQueryNames: camelToSnake
})

export const runMigrations = PgMigrator.run({
  loader: PgMigrator.fromFileSystem(fileURLToPath(new URL('../../migrations', import.meta.url)))
}).pipe(Effect.provide(NodeContext.layer))

export const truncateAll = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  yield* sql`TRUNCATE "user" CASCADE`
})
