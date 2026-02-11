import type { RequestHandler } from './$types'
import { Effect, Layer, Stream, pipe } from 'effect'
import { transcribe, OpenAiSttLive } from '$lib/features/stt/server/handler'
import { fromAbortSignal } from '$lib/http'
import { userSettingsLayer } from '$lib/server/user-settings'

export const POST: RequestHandler = ({ request, locals }) =>
  locals.session && locals.user
    ? pipe(
        Effect.tryPromise(() => request.arrayBuffer()),
        Effect.map((buf) => new Uint8Array(buf)),
        Effect.flatMap((payload) => transcribe(payload, request.signal)),
        Effect.map(
          (stream) =>
            new Response(Stream.toReadableStream(Stream.interruptWhen(stream, fromAbortSignal(request.signal))), {
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        ),
        Effect.tapError((e) => Effect.sync(() => Effect.logError('[STT]', e))),
        Effect.catchAll(() => Effect.succeed(new Response('Bad Request', { status: 400 }))),
        Effect.provide(Layer.merge(OpenAiSttLive, userSettingsLayer(locals.user))),
        Effect.runPromise
      )
    : new Response('Unauthorized', { status: 401 })
