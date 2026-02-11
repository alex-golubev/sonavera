import type { RequestHandler } from './$types'
import { Effect, Layer, Schema, Stream, pipe } from 'effect'
import { chat, OpenAiLlmLive } from '$lib/features/llm/server/handler'
import { LlmPayload } from '$lib/features/llm/schema'
import { fromAbortSignal } from '$lib/http'
import { userSettingsLayer } from '$lib/server/user-settings'

export const POST: RequestHandler = ({ request, locals }) =>
  locals.session && locals.user
    ? pipe(
        Effect.tryPromise(() => request.json()),
        Effect.flatMap(Schema.decodeUnknown(LlmPayload)),
        Effect.flatMap((payload) => chat(payload.messages, request.signal)),
        Effect.map(
          (stream) =>
            new Response(Stream.toReadableStream(Stream.interruptWhen(stream, fromAbortSignal(request.signal))), {
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        ),
        Effect.tapError((e) => Effect.sync(() => Effect.logError('[LLM]', e))),
        Effect.catchAll(() => Effect.succeed(new Response('Bad Request', { status: 400 }))),
        Effect.provide(Layer.merge(OpenAiLlmLive, userSettingsLayer(locals.user))),
        Effect.runPromise
      )
    : new Response('Unauthorized', { status: 401 })
