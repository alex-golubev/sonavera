import { Readable } from 'node:stream'
import { Effect, Layer, Stream, pipe } from 'effect'
import type OpenAI from 'openai'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { ConversationError } from '../../schema'
import { TTS } from '../tts'

const MODEL = 'gpt-4o-mini-tts'
const VOICE_INSTRUCTIONS = 'Speak clearly at a natural pace, suitable for language learners.'

const toTtsError = (error: unknown) => new ConversationError({ message: String(error), phase: 'tts' })

const bodyToStream = (body: ReadableStream | null) =>
  body
    ? Stream.fromAsyncIterable(Readable.fromWeb(body as import('node:stream/web').ReadableStream), toTtsError)
    : Stream.fail(new ConversationError({ message: 'Response body is null', phase: 'tts' }))

const createSpeech = (client: OpenAI, text: string, voice: string, signal?: AbortSignal) =>
  Effect.tryPromise({
    try: () =>
      client.audio.speech.create(
        {
          model: MODEL,
          voice,
          input: text,
          instructions: VOICE_INSTRUCTIONS,
          response_format: 'pcm'
        },
        { signal }
      ),
    catch: toTtsError
  })

export const OpenAiTtsLive = Layer.effect(
  TTS,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return TTS.of({
      speakStream: (text, voice, signal) =>
        pipe(
          createSpeech(client, text, voice, signal),
          Effect.map((response) => bodyToStream(response.body)),
          Stream.unwrap
        )
    })
  })
).pipe(Layer.provide(OpenAiClientLive))
