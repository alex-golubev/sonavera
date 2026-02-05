import { Context, Effect, Layer, Stream } from 'effect'
import OpenAI from 'openai'
import { TranscribeError } from '../schema'

export class OpenAiStt extends Context.Tag('OpenAiStt')<
  OpenAiStt,
  { readonly transcribeStream: (audio: Uint8Array, language: string) => Stream.Stream<string, TranscribeError> }
>() {}

export const OpenAiSttLive = Layer.effect(
  OpenAiStt,
  Effect.gen(function* () {
    const { env } = yield* Effect.promise(() => import('$env/dynamic/private'))
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY })

    return OpenAiStt.of({
      transcribeStream: (audio, language) =>
        Stream.unwrap(
          Effect.tryPromise({
            try: async () => {
              const file = new File([audio as BlobPart], 'audio.wav', { type: 'audio/wav' })
              const response = await client.audio.transcriptions.create({
                model: 'gpt-4o-mini-transcribe',
                file,
                language,
                stream: true,
                response_format: 'text'
              })
              return Stream.fromAsyncIterable(
                response,
                (error) => new TranscribeError({ message: String(error) })
              ).pipe(
                Stream.filter(
                  (event): event is OpenAI.Audio.TranscriptionTextDeltaEvent => event.type === 'transcript.text.delta'
                ),
                Stream.map((event) => event.delta)
              )
            },
            catch: (error) => new TranscribeError({ message: String(error) })
          })
        )
    })
  })
)
