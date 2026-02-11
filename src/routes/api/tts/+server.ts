import type { RequestHandler } from './$types'
import { Effect, Schema, Stream, pipe } from 'effect'
import { speak, OpenAiTtsLive } from '$lib/features/tts/server/handler'
import { TtsPayload } from '$lib/features/tts/schema'

export const POST: RequestHandler = ({ request, locals }) =>
  locals.session && locals.user
    ? pipe(
        Effect.tryPromise(() => request.json()),
        Effect.flatMap(Schema.decodeUnknown(TtsPayload)),
        Effect.flatMap((payload) => speak(payload.text, payload.voice)),
        Effect.map(
          (stream) =>
            new Response(Stream.toReadableStream(stream), {
              headers: { 'Content-Type': 'application/octet-stream' }
            })
        ),
        Effect.tapError((e) => Effect.sync(() => Effect.logError('[TTS]', e))),
        Effect.catchAll(() => Effect.succeed(new Response('Bad Request', { status: 400 }))),
        Effect.provide(OpenAiTtsLive),
        Effect.runPromise
      )
    : new Response('Unauthorized', { status: 401 })
