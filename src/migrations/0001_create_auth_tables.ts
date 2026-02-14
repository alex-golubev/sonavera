import { SqlClient } from '@effect/sql'
import { Effect } from 'effect'

// noinspection JSUnusedGlobalSymbols
export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE "user" (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      name            VARCHAR(100) NOT NULL,
      email           VARCHAR(255) NOT NULL UNIQUE,
      email_verified  BOOLEAN NOT NULL DEFAULT false,
      image           TEXT,
      native_language VARCHAR(5) NOT NULL DEFAULT 'en',
      target_language VARCHAR(5) NOT NULL DEFAULT 'es',
      level           VARCHAR(2) NOT NULL DEFAULT 'A1'
    );

    CREATE TABLE session (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      user_id         UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      token           VARCHAR(255) NOT NULL UNIQUE,
      expires_at      TIMESTAMPTZ NOT NULL,
      ip_address      VARCHAR(45),
      user_agent      TEXT
    );

    CREATE TABLE account (
      id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
      user_id                   UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      account_id                VARCHAR(255) NOT NULL,
      provider_id               VARCHAR(255) NOT NULL,
      access_token              TEXT,
      refresh_token             TEXT,
      access_token_expires_at   TIMESTAMPTZ,
      refresh_token_expires_at  TIMESTAMPTZ,
      scope                     TEXT,
      id_token                  TEXT,
      password                  TEXT
    );

    CREATE TABLE verification (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      identifier      VARCHAR(255) NOT NULL,
      value           TEXT NOT NULL,
      expires_at      TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX idx_session_user_id ON session(user_id);
    CREATE INDEX idx_account_user_id ON account(user_id);
    CREATE INDEX idx_account_provider ON account(provider_id, account_id);
    CREATE INDEX idx_verification_identifier ON verification(identifier);
  `
)
