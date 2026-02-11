import { Readable } from 'node:stream'
import { Context, Effect, Layer, Stream, pipe } from 'effect'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { TtsError, type TtsVoice } from '../schema'

const VOICE_INSTRUCTIONS = 'Speak clearly at a natural pace, suitable for language learners.'

const toTtsError = (error: unknown) => new TtsError({ message: String(error) })

const bodyToStream = (body: ReadableStream | null) =>
  body
    ? Stream.fromAsyncIterable(Readable.fromWeb(body as import('node:stream/web').ReadableStream), toTtsError)
    : Stream.fail(new TtsError({ message: 'Response body is null' }))

export class OpenAiTts extends Context.Tag('OpenAiTts')<
  OpenAiTts,
  {
    readonly speakStream: (text: string, voice: TtsVoice, signal?: AbortSignal) => Stream.Stream<Uint8Array, TtsError>
  }
>() {}

export const OpenAiTtsLive = Layer.effect(
  OpenAiTts,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return OpenAiTts.of({
      speakStream: (text, voice, signal) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              client.audio.speech.create(
                {
                  model: 'gpt-4o-mini-tts',
                  voice,
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
