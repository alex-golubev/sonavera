import { Effect, Stream, pipe } from 'effect'
import { UserSettings } from '$lib/server/user-settings'
import { OpenAiLlm } from './openai'
import type { LlmMessage } from '../schema'

export { OpenAiLlmLive } from './openai'

const encoder = new TextEncoder()

export const chat = (messages: ReadonlyArray<LlmMessage>) =>
  Effect.gen(function* () {
    const settings = yield* UserSettings
    const llm = yield* OpenAiLlm
    return pipe(
      llm.llmStream(messages, settings),
      Stream.map((delta) => encoder.encode(delta))
    )
  })
