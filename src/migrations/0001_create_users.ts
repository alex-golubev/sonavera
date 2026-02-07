import { SqlClient } from '@effect/sql'
import { Effect } from 'effect'

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE account (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email           VARCHAR(255) NOT NULL UNIQUE,
      password_hash   VARCHAR(255) NOT NULL,
      display_name    VARCHAR(100) NOT NULL,
      native_language VARCHAR(5) NOT NULL DEFAULT 'en',
      target_language VARCHAR(5) NOT NULL DEFAULT 'es',
      level           VARCHAR(2) NOT NULL DEFAULT 'A1',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
)
