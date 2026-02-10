import { HttpApiBuilder, HttpServerResponse } from '@effect/platform'
import { Effect, Layer, Stream, pipe } from 'effect'
import { LlmApi } from '../api'
import { OpenAiLlm, OpenAiLlmLive } from './openai'
import { userSettings } from '$lib/server/user-settings'

const encoder = new TextEncoder()

const LlmHandlers = HttpApiBuilder.group(LlmApi, 'llm', (handlers) =>
  handlers.handle('chat', ({ payload }) =>
    Effect.gen(function* () {
      const settings = yield* userSettings
      const llm = yield* OpenAiLlm
      return HttpServerResponse.stream(
        pipe(
          llm.llmStream(payload.messages, settings),
          Stream.map((delta) => encoder.encode(delta))
        ),
        { contentType: 'text/plain; charset=utf-8' }
      )
    })
  )
)

export const LlmLive = pipe(LlmHandlers, Layer.provide(OpenAiLlmLive))
