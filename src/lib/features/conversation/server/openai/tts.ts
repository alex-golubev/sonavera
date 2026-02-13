import { Readable } from 'node:stream'
import { Effect, Layer, Stream, pipe } from 'effect'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { ConversationError } from '../../schema'
import { Tts } from '../tts'

const VOICE_INSTRUCTIONS = 'Speak clearly at a natural pace, suitable for language learners.'

const toTtsError = (error: unknown) => new ConversationError({ message: String(error), phase: 'tts' })

const bodyToStream = (body: ReadableStream | null) =>
  body
    ? Stream.fromAsyncIterable(Readable.fromWeb(body as import('node:stream/web').ReadableStream), toTtsError)
    : Stream.fail(new ConversationError({ message: 'Response body is null', phase: 'tts' }))

export const OpenAiTtsLive = Layer.effect(
  Tts,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return Tts.of({
      speakStream: (text, voice, signal) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              client.audio.speech.create(
                {
                  model: 'gpt-4o-mini-tts',
                  voice: voice,
                  input: text,
                  instructions: VOICE_INSTRUCTIONS,
                  response_format: 'pcm'
                },
                { signal }
              ),
            catch: toTtsError
          }),
          Effect.map((response) => bodyToStream(response.body)),
          Stream.unwrap
        )
    })
  })
).pipe(Layer.provide(OpenAiClientLive))
