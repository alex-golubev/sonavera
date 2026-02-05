import { Readable } from 'node:stream'
import { Context, Effect, Layer, Stream } from 'effect'
import OpenAI from 'openai'
import { TtsError } from '../schema'

const VOICE_INSTRUCTIONS = 'Speak clearly at a natural pace, suitable for language learners.'

export class OpenAiTts extends Context.Tag('OpenAiTts')<
  OpenAiTts,
  { readonly speakStream: (text: string, voice: string) => Stream.Stream<Uint8Array, TtsError> }
>() {}

export const OpenAiTtsLive = Layer.effect(
  OpenAiTts,
  Effect.gen(function* () {
    const { env } = yield* Effect.promise(() => import('$env/dynamic/private'))
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY })

    return OpenAiTts.of({
      speakStream: (text, voice) =>
        Stream.unwrap(
          Effect.tryPromise({
            try: async () => {
              const response = await client.audio.speech.create({
                model: 'gpt-4o-mini-tts',
                voice: voice as 'coral',
                input: text,
                instructions: VOICE_INSTRUCTIONS,
                response_format: 'pcm'
              })
              const body = response.body
              return body
                ? Stream.fromAsyncIterable(
                    Readable.fromWeb(body as import('node:stream/web').ReadableStream),
                    (error) => new TtsError({ message: String(error) })
                  )
                : Stream.fail(new TtsError({ message: 'Response body is null' }))
            },
            catch: (error) => new TtsError({ message: String(error) })
          })
        )
    })
  })
)
