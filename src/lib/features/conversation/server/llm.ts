import { Context, Data, Stream } from 'effect'
import { ConversationError, type ConversationMessage, type CorrectionItem } from '../schema'
import type { UserSettingsValue } from '$lib/server/user-settings'

// --- LLM stream delta types ---

export class LlmContentDelta extends Data.TaggedClass('LlmContentDelta')<{ readonly text: string }> {}
export class LlmCorrections extends Data.TaggedClass('LlmCorrections')<{
  readonly corrections: ReadonlyArray<CorrectionItem>
}> {}
export type LlmDelta = LlmContentDelta | LlmCorrections

// --- LLM service ---

export class LLM extends Context.Tag('LLM')<
  LLM,
  {
    readonly provider: string
    readonly model: string
    readonly llmStream: (
      messages: ReadonlyArray<ConversationMessage>,
      settings: UserSettingsValue,
      signal?: AbortSignal
    ) => Stream.Stream<LlmDelta, ConversationError>
  }
>() {}
