import { Context, Data, Effect } from 'effect'
import type { SqlError } from '@effect/sql/SqlError'
import type { CorrectionItem } from '../schema'

export class ConversationAccessDenied extends Data.TaggedError('ConversationAccessDenied')<{
  readonly conversationId: string
}> {}

export interface SaveResult {
  readonly conversationId: string
  readonly messages: ReadonlyArray<{
    readonly id: string
    readonly role: string
    readonly content: string
  }>
  readonly corrections: ReadonlyArray<{
    readonly messageId: string
    readonly category: string
    readonly original: string
    readonly correction: string
    readonly explanation: string
  }>
}

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
      readonly corrections: ReadonlyArray<CorrectionItem>
    }) => Effect.Effect<SaveResult, SqlError>

    readonly saveSubsequent: (params: {
      readonly userId: string
      readonly conversationId: string
      readonly turnId: string
      readonly userText: string
      readonly assistantText: string
      readonly corrections: ReadonlyArray<CorrectionItem>
    }) => Effect.Effect<SaveResult, SqlError | ConversationAccessDenied>

    readonly load: (params: {
      readonly userId: string
      readonly conversationId: string
    }) => Effect.Effect<SaveResult, SqlError | ConversationAccessDenied>
  }
>() {}
