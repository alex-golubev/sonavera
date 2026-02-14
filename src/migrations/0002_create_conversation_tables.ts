import { SqlClient } from '@effect/sql'
import { Effect } from 'effect'

// noinspection JSUnusedGlobalSymbols
export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE conversation (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      user_id         UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      title           VARCHAR(255),
      native_language VARCHAR(2) NOT NULL CHECK (native_language IN ('en','es','fr','de','pt','it','ja','zh','ko','ru','he')),
      target_language VARCHAR(2) NOT NULL CHECK (target_language IN ('en','es','fr','de','pt','it','ja','zh','ko','ru','he')),
      level           VARCHAR(2) NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
      provider        VARCHAR(50) NOT NULL,
      model           VARCHAR(100) NOT NULL,
      status          VARCHAR(10) NOT NULL DEFAULT 'active'
    );

    CREATE TABLE message (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
      role            VARCHAR(10) NOT NULL,
      content         TEXT NOT NULL,
      ordinal         INTEGER NOT NULL
    );

    CREATE TABLE correction (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      message_id      UUID NOT NULL REFERENCES message(id) ON DELETE CASCADE,
      original        TEXT NOT NULL,
      correction      TEXT NOT NULL,
      explanation     TEXT,
      category        VARCHAR(20) NOT NULL
    );

    CREATE INDEX idx_conversation_user_status_updated ON conversation(user_id, status, updated_at DESC);
    CREATE UNIQUE INDEX idx_message_conversation_ordinal ON message(conversation_id, ordinal);
    CREATE INDEX idx_correction_message_id ON correction(message_id);
  `
)
