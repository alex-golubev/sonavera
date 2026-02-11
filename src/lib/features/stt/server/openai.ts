import { Context, Effect, Layer, Stream, pipe } from 'effect'
import type OpenAI from 'openai'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { TranscribeError } from '../schema'

const toTranscribeError = (error: unknown) => new TranscribeError({ message: String(error) })

export class OpenAiStt extends Context.Tag('OpenAiStt')<
  OpenAiStt,
  {
    readonly transcribeStream: (
      audio: Uint8Array,
      language: string,
      signal?: AbortSignal
    ) => Stream.Stream<string, TranscribeError>
  }
>() {}

export const OpenAiSttLive = Layer.effect(
  OpenAiStt,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return OpenAiStt.of({
      transcribeStream: (audio, language, signal) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              client.audio.transcriptions.create(
                {
                  model: 'gpt-4o-mini-transcribe',
                  file: new File([audio as BlobPart], 'audio.wav', { type: 'audio/wav' }),
                  language,
                  stream: true
                },
                { signal }
              ),
            catch: toTranscribeError
          }),
          Effect.map((response) => Stream.fromAsyncIterable(response, toTranscribeError)),
          Stream.unwrap,
          Stream.filter(
            (event): event is OpenAI.Audio.TranscriptionTextDeltaEvent => event.type === 'transcript.text.delta'
          ),
          Stream.map((event) => event.delta)
        )
    })
  })
).pipe(Layer.provide(OpenAiClientLive))
