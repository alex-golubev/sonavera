import { Context, Stream } from 'effect'
import { ConversationError, type ConversationMessage } from '../schema'
import type { UserSettingsValue } from '$lib/server/user-settings'

export class LLM extends Context.Tag('LLM')<
  LLM,
  {
    readonly provider: string
    readonly model: string
    readonly llmStream: (
      messages: ReadonlyArray<ConversationMessage>,
      settings: UserSettingsValue,
      signal?: AbortSignal
    ) => Stream.Stream<string, ConversationError>
  }
>() {}
