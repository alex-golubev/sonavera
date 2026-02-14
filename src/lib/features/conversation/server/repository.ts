import { Context, Data, Effect } from 'effect'
import type { SqlError } from '@effect/sql/SqlError'

export class ConversationAccessDenied extends Data.TaggedError('ConversationAccessDenied')<{
  readonly conversationId: string
}> {}

export class ConversationRepository extends Context.Tag('ConversationRepository')<
  ConversationRepository,
  {
    readonly saveFirst: (params: {
      readonly conversationId: string
      readonly userId: string
      readonly nativeLanguage: string
      readonly targetLanguage: string
      readonly level: string
      readonly provider: string
      readonly model: string
      readonly turnId: string
      readonly userText: string
      readonly assistantText: string
    }) => Effect.Effect<{ readonly conversationId: string }, SqlError>

    readonly saveSubsequent: (params: {
      readonly userId: string
      readonly conversationId: string
      readonly turnId: string
      readonly ordinalOffset: number
      readonly userText: string
      readonly assistantText: string
    }) => Effect.Effect<{ readonly conversationId: string }, SqlError | ConversationAccessDenied>
  }
>() {}
