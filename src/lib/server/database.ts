import { PgClient } from '@effect/sql-pg'
import { env } from '$env/dynamic/private'
import { ManagedRuntime, Redacted } from 'effect'

const snakeToCamel = (s: string): string => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

const camelToSnake = (s: string): string => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)

export const DatabaseLive = PgClient.layer({
  url: Redacted.make(env.DATABASE_URL ?? ''),
  maxConnections: 5,
  idleTimeout: '30 seconds',
  connectTimeout: '10 seconds',
  transformResultNames: snakeToCamel,
  transformQueryNames: camelToSnake
})

export const dbRuntime = ManagedRuntime.make(DatabaseLive)
