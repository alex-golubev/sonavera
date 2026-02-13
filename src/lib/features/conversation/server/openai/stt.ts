import { Effect, Layer, Stream, pipe } from 'effect'
import type OpenAI from 'openai'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { ConversationError } from '../../schema'
import { Stt } from '../stt'

const toSttError = (error: unknown) => new ConversationError({ message: String(error), phase: 'stt' })

export const OpenAiSttLive = Layer.effect(
  Stt,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return Stt.of({
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
            catch: toSttError
          }),
          Effect.map((response) => Stream.fromAsyncIterable(response, toSttError)),
          Stream.unwrap,
          Stream.filter(
            (event): event is OpenAI.Audio.TranscriptionTextDeltaEvent => event.type === 'transcript.text.delta'
          ),
          Stream.map((event) => event.delta)
        )
    })
  })
).pipe(Layer.provide(OpenAiClientLive))
