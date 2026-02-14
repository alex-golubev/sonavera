import { SqlClient } from '@effect/sql'
import { Effect, Layer } from 'effect'
import { ConversationRepository } from './repository'

export const ConversationRepositoryLive = Layer.effect(
  ConversationRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    return ConversationRepository.of({
      saveFirst: (params) =>
        sql.withTransaction(
          Effect.gen(function* () {
            const rows = yield* sql`
              INSERT INTO conversation (user_id, native_language, target_language, level, provider, model)
              VALUES (${params.userId}, ${params.nativeLanguage}, ${params.targetLanguage}, ${params.level}, ${params.provider}, ${params.model})
              RETURNING id
            `
            const conversationId = (rows[0] as { id: string }).id

            yield* sql`
              INSERT INTO message (conversation_id, role, content, ordinal)
              VALUES (${conversationId}, 'user', ${params.userText}, 0)
            `

            yield* sql`
              INSERT INTO message (conversation_id, role, content, ordinal)
              VALUES (${conversationId}, 'assistant', ${params.assistantText}, 1)
            `

            return { conversationId }
          })
        ),

      saveSubsequent: (params) =>
        sql.withTransaction(
          Effect.gen(function* () {
            yield* sql`
              UPDATE conversation SET updated_at = now() WHERE id = ${params.conversationId}
            `

            yield* sql`
              INSERT INTO message (conversation_id, role, content, ordinal)
              VALUES (${params.conversationId}, 'user', ${params.userText}, ${params.ordinalOffset})
            `

            yield* sql`
              INSERT INTO message (conversation_id, role, content, ordinal)
              VALUES (${params.conversationId}, 'assistant', ${params.assistantText}, ${params.ordinalOffset + 1})
            `

            return { conversationId: params.conversationId }
          })
        )
    })
  })
)
