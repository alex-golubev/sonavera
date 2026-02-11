import { HttpClient, HttpClientRequest } from '@effect/platform'
import { Atom, type Registry } from '$lib/effect-atom'
import { withStallTimeout } from '$lib/http'
import { clientRuntime } from '$lib/runtime'
import { Effect, Fiber, Option, Stream, pipe } from 'effect'
import { LlmError, type LlmMessage } from './schema'

// --- State atoms ---

export const messages = Atom.make<ReadonlyArray<LlmMessage>>([])
export const responding = Atom.make(false)
export const error = Atom.make('')
export const streamingText = Atom.make('')

// --- Internal ---

const fiberRef = Atom.keepAlive(Atom.make<Fiber.RuntimeFiber<void, unknown> | undefined>(undefined))

const streamEffect = (registry: Registry.Registry) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const request = yield* pipe(
      HttpClientRequest.post('/api/llm'),
      HttpClientRequest.bodyJson({ messages: [...registry.get(messages)] })
    )
    const response = yield* client.execute(request)

    yield* response.status >= 400
      ? Effect.gen(function* () {
          const msg = yield* response.text
          return yield* Effect.fail(new LlmError({ message: msg }))
        })
      : pipe(
          withStallTimeout(response.stream),
          Stream.decodeText(),
          Stream.runForEach((delta) =>
            Effect.sync(() => registry.set(streamingText, registry.get(streamingText) + delta))
          ),
          Effect.andThen(
            Effect.sync(() => {
              const fullText = registry.get(streamingText)
              registry.set(messages, [...registry.get(messages), { role: 'assistant', content: fullText }])
              registry.set(streamingText, '')
              registry.set(responding, false)
            })
          )
        )
  }).pipe(
    Effect.catchAll((err) =>
      Effect.sync(() => {
        registry.set(responding, false)
        registry.set(error, String(err))
      })
    )
  )

// --- Public API ---

export const send = (registry: Registry.Registry, userMessage: string) =>
  Effect.sync(() => {
    registry.set(messages, [...registry.get(messages), { role: 'user', content: userMessage }])
    const prev = registry.get(fiberRef)
    const fiber = clientRuntime.runFork(
      pipe(
        prev ? Fiber.interrupt(prev) : Effect.void,
        Effect.andThen(
          Effect.sync(() => {
            registry.set(streamingText, '')
            registry.set(responding, true)
            registry.set(error, '')
          })
        ),
        Effect.andThen(streamEffect(registry))
      )
    )
    registry.set(fiberRef, fiber)
  })

export const reset = (registry: Registry.Registry) =>
  Effect.sync(() => {
    const fiber = registry.get(fiberRef)
    registry.set(fiberRef, undefined)
    registry.set(messages, [])
    registry.set(responding, false)
    registry.set(streamingText, '')
    registry.set(error, '')
    pipe(
      Option.fromNullable(fiber),
      Option.match({
        onNone: () => {},
        onSome: (f) => Effect.runFork(Fiber.interrupt(f))
      })
    )
  })
