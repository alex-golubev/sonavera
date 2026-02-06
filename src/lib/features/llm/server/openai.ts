import { Context, Effect, Layer, Option, Stream, pipe } from 'effect'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { LlmError, type LlmMessage } from '../schema'
import type { Language } from '$lib/features/language/schema'
import type { Level } from '$lib/features/level/schema'
import { systemPrompt } from './prompt'

const toLlmError = (error: unknown) => new LlmError({ message: String(error) })

export class OpenAiLlm extends Context.Tag('OpenAiLlm')<
  OpenAiLlm,
  {
    readonly llmStream: (
      messages: ReadonlyArray<LlmMessage>,
      language: Language,
      level: Level
    ) => Stream.Stream<string, LlmError>
  }
>() {}

export const OpenAiLlmLive = Layer.effect(
  OpenAiLlm,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return OpenAiLlm.of({
      llmStream: (messages, language, level) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              client.chat.completions.create({
                model: 'gpt-4.1-mini',
                stream: true,
                messages: [
                  { role: 'developer', content: systemPrompt(language, level) },
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
