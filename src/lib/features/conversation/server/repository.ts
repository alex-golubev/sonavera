import { Context, Effect } from 'effect'
import type { SqlError } from '@effect/sql/SqlError'

export class ConversationRepository extends Context.Tag('ConversationRepository')<
  ConversationRepository,
  {
    readonly saveFirst: (params: {
      readonly userId: string
      readonly nativeLanguage: string
      readonly targetLanguage: string
      readonly level: string
      readonly provider: string
      readonly model: string
      readonly userText: string
      readonly assistantText: string
    }) => Effect.Effect<{ readonly conversationId: string }, SqlError>

    readonly saveSubsequent: (params: {
      readonly conversationId: string
      readonly ordinalOffset: number
      readonly userText: string
      readonly assistantText: string
    }) => Effect.Effect<{ readonly conversationId: string }, SqlError>
  }
>() {}
