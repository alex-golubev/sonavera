import { Effect, Layer, Option, Stream, pipe } from 'effect'
import type { OpenAI } from 'openai'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { ConversationError, type ConversationMessage } from '../../schema'
import { systemPrompt } from '../prompt'
import { LLM } from '../llm'
import type { UserSettingsValue } from '$lib/server/user-settings'

const MODEL = 'gpt-4.1-mini'

const toLlmError = (error: unknown) => new ConversationError({ message: String(error), phase: 'llm' })

const createCompletion = (
  client: OpenAI,
  messages: ReadonlyArray<ConversationMessage>,
  settings: UserSettingsValue,
  signal?: AbortSignal
) =>
  Effect.tryPromise({
    try: () =>
      client.chat.completions.create(
        {
          model: MODEL,
          stream: true,
          messages: [
            { role: 'developer', content: systemPrompt(settings) },
            ...messages.map((m) => ({ role: m.role, content: m.content }))
          ]
        },
        { signal }
      ),
    catch: toLlmError
  })

const extractDeltas = (chunk: OpenAI.Chat.Completions.ChatCompletionChunk) => {
  const delta = chunk.choices[0]?.delta?.content
  return delta ? Option.some(delta) : Option.none()
}

export const OpenAiLlmLive = Layer.effect(
  LLM,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return LLM.of({
      provider: 'openai',
      model: MODEL,
      llmStream: (messages, settings, signal) =>
        pipe(
          createCompletion(client, messages, settings, signal),
          Effect.map((response) => Stream.fromAsyncIterable(response, toLlmError)),
          Stream.unwrap,
          Stream.filterMap(extractDeltas)
        )
    })
  })
).pipe(Layer.provide(OpenAiClientLive))
