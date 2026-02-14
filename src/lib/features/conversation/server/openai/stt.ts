import { Effect, Layer, Stream, pipe } from 'effect'
import type OpenAI from 'openai'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { ConversationError } from '../../schema'
import { STT } from '../stt'

const MODEL = 'gpt-4o-mini-transcribe'

const toSttError = (error: unknown) => new ConversationError({ message: String(error), phase: 'stt' })

const createTranscription = (client: OpenAI, audio: Uint8Array, language: string, signal?: AbortSignal) =>
  Effect.tryPromise({
    try: () =>
      client.audio.transcriptions.create(
        {
          model: MODEL,
          file: new File([audio as BlobPart], 'audio.wav', { type: 'audio/wav' }),
          language,
          temperature: 0,
          stream: true
        },
        { signal }
      ),
    catch: toSttError
  })

const isTextDelta = (event: unknown): event is OpenAI.Audio.TranscriptionTextDeltaEvent =>
  (event as OpenAI.Audio.TranscriptionTextDeltaEvent).type === 'transcript.text.delta'

export const OpenAiSttLive = Layer.effect(
  STT,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return STT.of({
      transcribeStream: (audio, language, signal) =>
        pipe(
          createTranscription(client, audio, language, signal),
          Effect.map((response) => Stream.fromAsyncIterable(response, toSttError)),
          Stream.unwrap,
          Stream.filter(isTextDelta),
          Stream.map((event) => event.delta)
        )
    })
  })
).pipe(Layer.provide(OpenAiClientLive))
