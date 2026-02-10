import type { RequestHandler } from './$types'
import { Effect, Layer, Schema, Stream, pipe } from 'effect'
import { chat, OpenAiLlmLive } from '$lib/features/llm/server/handler'
import { LlmPayload } from '$lib/features/llm/schema'
import { userSettingsLayer } from '$lib/server/user-settings'

export const POST: RequestHandler = ({ request, locals }) =>
  locals.session && locals.user
    ? pipe(
        Effect.tryPromise(() => request.json()),
        Effect.flatMap(Schema.decodeUnknown(LlmPayload)),
        Effect.flatMap((payload) => chat(payload.messages)),
        Effect.map(
          (stream) =>
            new Response(Stream.toReadableStream(stream), {
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        ),
        Effect.catchAll(() => Effect.succeed(new Response('Bad Request', { status: 400 }))),
        Effect.provide(Layer.merge(OpenAiLlmLive, userSettingsLayer(locals.user))),
        Effect.runPromise
      )
    : new Response('Unauthorized', { status: 401 })
