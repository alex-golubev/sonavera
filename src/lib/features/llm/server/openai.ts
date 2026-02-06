import { Context, Effect, Layer, Option, Stream, pipe } from 'effect'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { LlmError, type LlmMessage } from '../schema'

const SYSTEM_PROMPT = [
  'You are a friendly and patient English language tutor.',
  "Adapt your language complexity to match the user's level —",
  'if they make mistakes or use simple structures, simplify your responses;',
  'if they write fluently, challenge them more.',
  'Correct errors naturally by rephrasing,',
  'and occasionally introduce new vocabulary or grammar concepts.',
  'Keep responses concise and conversational.',
  'Respond in English.'
].join(' ')

const toLlmError = (error: unknown) => new LlmError({ message: String(error) })

export class OpenAiLlm extends Context.Tag('OpenAiLlm')<
  OpenAiLlm,
  { readonly llmStream: (messages: ReadonlyArray<LlmMessage>) => Stream.Stream<string, LlmError> }
>() {}

export const OpenAiLlmLive = Layer.effect(
  OpenAiLlm,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return OpenAiLlm.of({
      llmStream: (messages) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              client.chat.completions.create({
                model: 'gpt-4.1-mini',
                stream: true,
                messages: [
                  { role: 'developer', content: SYSTEM_PROMPT },
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
