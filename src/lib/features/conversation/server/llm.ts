import { Context, Stream } from 'effect'
import { ConversationError, type ConversationMessage } from '../schema'
import type { UserSettingsValue } from '$lib/server/user-settings'

export class Llm extends Context.Tag('Llm')<
  Llm,
  {
    readonly llmStream: (
      messages: ReadonlyArray<ConversationMessage>,
      settings: UserSettingsValue,
      signal?: AbortSignal
    ) => Stream.Stream<string, ConversationError>
  }
>() {}
