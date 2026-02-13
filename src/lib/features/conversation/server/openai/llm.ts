import { Effect, Layer, Option, Stream, pipe } from 'effect'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { ConversationError } from '../../schema'
import { systemPrompt } from '../prompt'
import { Llm } from '../llm'

const toLlmError = (error: unknown) => new ConversationError({ message: String(error), phase: 'llm' })

export const OpenAiLlmLive = Layer.effect(
  Llm,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return Llm.of({
      llmStream: (messages, settings, signal) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              client.chat.completions.create(
                {
                  model: 'gpt-4.1-mini',
                  stream: true,
                  messages: [
                    { role: 'developer', content: systemPrompt(settings) },
                    ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
                  ]
                },
                { signal }
              ),
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
