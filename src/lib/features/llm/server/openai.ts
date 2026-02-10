import { Context, Effect, Layer, Option, Stream, pipe } from 'effect'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { LlmError, type LlmMessage } from '../schema'
import type { UserSettings } from '$lib/server/user-settings'
import { systemPrompt } from './prompt'

const toLlmError = (error: unknown) => new LlmError({ message: String(error) })

export class OpenAiLlm extends Context.Tag('OpenAiLlm')<
  OpenAiLlm,
  {
    readonly llmStream: (messages: ReadonlyArray<LlmMessage>, settings: UserSettings) => Stream.Stream<string, LlmError>
  }
>() {}

export const OpenAiLlmLive = Layer.effect(
  OpenAiLlm,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return OpenAiLlm.of({
      llmStream: (messages, settings) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              client.chat.completions.create({
                model: 'gpt-4.1-mini',
                stream: true,
                messages: [
                  { role: 'developer', content: systemPrompt(settings) },
                  ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
                ]
              }),
            catch: toLlmError
          }),
          Effect.map((response) => Stream.fromAsyncIterable(response, toLlmError)),
          Stream.unwrap,
          Stream.filterMap((chunk) => {
            const delta = chunk.choices[0]?.delta?.content
            return delta ? Option.some(delta) : Option.none()
          })
        )
    })
  })
).pipe(Layer.provide(OpenAiClientLive))
