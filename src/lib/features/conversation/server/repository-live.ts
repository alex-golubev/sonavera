import { SqlClient } from '@effect/sql'
import { Effect, Layer } from 'effect'
import type { CorrectionItem } from '../schema'
import { ConversationAccessDenied, ConversationRepository, type SaveResult } from './repository'

const insertCorrections = (
  sql: SqlClient.SqlClient,
  userMessageId: string,
  corrections: ReadonlyArray<CorrectionItem>
) =>
  Effect.forEach(
    corrections,
    (c) =>
      sql`
      INSERT INTO correction (message_id, category, original, correction, explanation)
      VALUES (${userMessageId}, ${c.category}, ${c.original}, ${c.correction}, ${c.explanation})
    `
  )

const buildCorrections = (
  userMessageId: string,
  corrections: ReadonlyArray<CorrectionItem>
): SaveResult['corrections'] =>
  corrections.map((c) => ({
    messageId: userMessageId,
    category: c.category,
    original: c.original,
    correction: c.correction,
    explanation: c.explanation
  }))

const selectAllMessages = (sql: SqlClient.SqlClient, conversationId: string) =>
  sql<{ id: string; role: string; content: string }>`
    SELECT id, role, content FROM message
    WHERE conversation_id = ${conversationId}
    ORDER BY ordinal
  `

const selectAllCorrections = (sql: SqlClient.SqlClient, conversationId: string) =>
  sql<{ messageId: string; category: string; original: string; correction: string; explanation: string }>`
    SELECT c.message_id, c.category, c.original, c.correction, c.explanation
    FROM correction c
    JOIN message m ON c.message_id = m.id
    WHERE m.conversation_id = ${conversationId}
  `

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

            const [userMsg] = yield* sql<{ id: string }>`
              INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
              VALUES (${params.conversationId}, ${params.turnId}, 'user', ${params.userText}, 0)
              ON CONFLICT (conversation_id, turn_id, role) DO UPDATE SET content = EXCLUDED.content
              RETURNING id
            `

            const [assistantMsg] = yield* sql<{ id: string }>`
              INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
              VALUES (${params.conversationId}, ${params.turnId}, 'assistant', ${params.assistantText}, 1)
              ON CONFLICT (conversation_id, turn_id, role) DO UPDATE SET content = EXCLUDED.content
              RETURNING id
            `

            yield* insertCorrections(sql, userMsg.id, params.corrections)

            return {
              conversationId: params.conversationId,
              messages: [
                { id: userMsg.id, role: 'user', content: params.userText },
                { id: assistantMsg.id, role: 'assistant', content: params.assistantText }
              ],
              corrections: buildCorrections(userMsg.id, params.corrections)
            }
          })
        ),

      load: (params) =>
        Effect.gen(function* () {
          const found = yield* sql`
            SELECT id FROM conversation
            WHERE id = ${params.conversationId} AND user_id = ${params.userId}
          `

          yield* found.length === 0
            ? Effect.fail(new ConversationAccessDenied({ conversationId: params.conversationId }))
            : Effect.void

          const allMessages = yield* selectAllMessages(sql, params.conversationId)
          const allCorrections = yield* selectAllCorrections(sql, params.conversationId)

          return {
            conversationId: params.conversationId,
            messages: allMessages.map((m) => ({ id: m.id, role: m.role, content: m.content })),
            corrections: allCorrections.map((c) => ({
              messageId: c.messageId,
              category: c.category,
              original: c.original,
              correction: c.correction,
              explanation: c.explanation
            }))
          }
        }),

      saveSubsequent: (params) =>
        sql.withTransaction(
          Effect.gen(function* () {
            // UPDATE acquires a row-level exclusive lock on the conversation row,
            // serializing concurrent saveSubsequent calls for the same conversationId.
            // This ensures SELECT MAX(ordinal) below sees committed inserts from prior transactions.
            // Do not reorder: the lock must be acquired before reading ordinals.
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

            const [userMsg] = yield* sql<{ id: string }>`
              INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
              VALUES (${params.conversationId}, ${params.turnId}, 'user', ${params.userText}, ${nextOrdinal})
              ON CONFLICT (conversation_id, turn_id, role) DO UPDATE SET content = EXCLUDED.content
              RETURNING id
            `

            yield* sql`
              INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
              VALUES (${params.conversationId}, ${params.turnId}, 'assistant', ${params.assistantText}, ${nextOrdinal + 1})
              ON CONFLICT (conversation_id, turn_id, role) DO UPDATE SET content = EXCLUDED.content
              RETURNING id
            `

            yield* insertCorrections(sql, userMsg.id, params.corrections)

            const allMessages = yield* selectAllMessages(sql, params.conversationId)
            const allCorrections = yield* selectAllCorrections(sql, params.conversationId)

            return {
              conversationId: params.conversationId,
              messages: allMessages.map((m) => ({ id: m.id, role: m.role, content: m.content })),
              corrections: allCorrections.map((c) => ({
                messageId: c.messageId,
                category: c.category,
                original: c.original,
                correction: c.correction,
                explanation: c.explanation
              }))
            }
          })
        )
    })
  })
)
