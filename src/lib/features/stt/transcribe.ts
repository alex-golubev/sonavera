import { FetchHttpClient, HttpClient, HttpClientRequest } from '@effect/platform'
import type { Registry } from '$lib/effect-atom'
import { Effect, Fiber, Stream, pipe } from 'effect'
import { error, fiberRef, text, transcribing } from './atoms'

const transcribeEffect = (registry: Registry.Registry, audio: Uint8Array, language: string) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.execute(
      pipe(
        HttpClientRequest.post('/api/stt'),
        HttpClientRequest.setUrlParam('language', language),
        HttpClientRequest.bodyUint8Array(audio, 'application/octet-stream')
      )
    )

    yield* response.status >= 400
      ? Effect.gen(function* () {
          const msg = yield* response.text
          registry.set(error, msg)
        })
      : pipe(
          response.stream,
          Stream.decodeText(),
          Stream.runForEach((delta) => Effect.sync(() => registry.set(text, registry.get(text) + delta)))
        )
  }).pipe(
    Effect.provide(FetchHttpClient.layer),
    Effect.catchAll((err) => Effect.sync(() => registry.set(error, String(err)))),
    Effect.ensuring(Effect.sync(() => registry.set(transcribing, false)))
  )

export const consumeTranscription = (registry: Registry.Registry, audio: Uint8Array, language: string) => {
  const prev = registry.get(fiberRef)
  const fiber = Effect.runFork(
    pipe(
      prev ? Fiber.interrupt(prev) : Effect.void,
      Effect.andThen(
        Effect.sync(() => {
          registry.set(text, '')
          registry.set(transcribing, true)
          registry.set(error, '')
        })
      ),
      Effect.andThen(transcribeEffect(registry, audio, language))
    )
  )
  registry.set(fiberRef, fiber)
}
