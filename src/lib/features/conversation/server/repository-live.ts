import { SqlClient } from '@effect/sql'
import { Effect, Layer } from 'effect'
import { ConversationAccessDenied, ConversationRepository } from './repository'

export const ConversationRepositoryLive = Layer.effect(
  ConversationRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    return ConversationRepository.of({
      saveFirst: (params) =>
        sql.withTransaction(
          Effect.gen(function* () {
            yield* sql`
              INSERT INTO conversation (id, user_id, native_language, target_language, level, provider, model)
              VALUES (${params.conversationId}, ${params.userId}, ${params.nativeLanguage}, ${params.targetLanguage}, ${params.level}, ${params.provider}, ${params.model})
              ON CONFLICT (id) DO NOTHING
            `

            yield* sql`
              INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
              VALUES (${params.conversationId}, ${params.turnId}, 'user', ${params.userText}, 0)
              ON CONFLICT (conversation_id, turn_id, role) DO NOTHING
            `

            yield* sql`
              INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
              VALUES (${params.conversationId}, ${params.turnId}, 'assistant', ${params.assistantText}, 1)
              ON CONFLICT (conversation_id, turn_id, role) DO NOTHING
            `

            return { conversationId: params.conversationId }
          })
        ),

      saveSubsequent: (params) =>
        sql.withTransaction(
          Effect.gen(function* () {
            const updated = yield* sql`
              UPDATE conversation SET updated_at = now()
              WHERE id = ${params.conversationId} AND user_id = ${params.userId}
              RETURNING id
            `

            yield* updated.length === 0
              ? Effect.fail(new ConversationAccessDenied({ conversationId: params.conversationId }))
              : Effect.void

            const [{ nextOrdinal }] = yield* sql<{ nextOrdinal: number }>`
              SELECT COALESCE(MAX(ordinal), -1) + 1 AS next_ordinal
              FROM message
              WHERE conversation_id = ${params.conversationId}
            `

            yield* sql`
              INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
              VALUES (${params.conversationId}, ${params.turnId}, 'user', ${params.userText}, ${nextOrdinal})
              ON CONFLICT (conversation_id, turn_id, role) DO NOTHING
            `

            yield* sql`
              INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
              VALUES (${params.conversationId}, ${params.turnId}, 'assistant', ${params.assistantText}, ${nextOrdinal + 1})
              ON CONFLICT (conversation_id, turn_id, role) DO NOTHING
            `

            return { conversationId: params.conversationId }
          })
        )
    })
  })
)
