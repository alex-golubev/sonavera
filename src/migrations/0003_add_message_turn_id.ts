import { SqlClient } from '@effect/sql'
import { Effect } from 'effect'

// noinspection JSUnusedGlobalSymbols
export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    ALTER TABLE message ADD COLUMN turn_id uuid;
    ALTER TABLE message ADD CONSTRAINT message_conversation_turn_role_key
      UNIQUE (conversation_id, turn_id, role);
  `
)
