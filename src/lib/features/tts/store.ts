import { HttpClient, HttpClientRequest } from '@effect/platform'
import { Atom, type Registry } from '$lib/effect-atom'
import { clientRuntime } from '$lib/runtime'
import { Effect, Fiber, Option, Stream, pipe } from 'effect'
import { type PCMPlayer, createPlayer, pcmConfig } from './pcm-player'
import { TtsError, type TtsVoice } from './schema'

// --- State atoms ---

export const playing = Atom.make(false)
export const loading = Atom.make(false)
export const error = Atom.make('')
export const muted = Atom.make(false)

// --- Internal refs ---

const fiberRef = Atom.keepAlive(Atom.make<Fiber.RuntimeFiber<void, unknown> | undefined>(undefined))
const playerRef = Atom.keepAlive(Atom.make<PCMPlayer | undefined>(undefined))

// --- Helpers ---

const stopPlayer = (registry: Registry.Registry) => {
  registry.get(playerRef)?.stop()
  registry.set(playing, false)
}

const resetAll = (registry: Registry.Registry) => {
  stopPlayer(registry)
  registry.set(loading, false)
}

const setError = (registry: Registry.Registry, msg: string) => {
  resetAll(registry)
  registry.set(error, msg)
}

const ensurePlayer = (registry: Registry.Registry): Effect.Effect<PCMPlayer, string> =>
  Effect.gen(function* () {
    const player =
      registry.get(playerRef) ??
      (() => {
        const p = createPlayer(new AudioContext({ sampleRate: pcmConfig.sampleRate }))
        registry.set(playerRef, p)
        return p
      })()

    yield* player.context.state === 'suspended'
      ? Effect.tryPromise({ try: () => player.context.resume(), catch: String })
      : Effect.void

    return player
  })

// --- Stream consumption ---

const streamEffect = (registry: Registry.Registry, text: string, voice: TtsVoice) =>
  Effect.gen(function* () {
    const player = yield* ensurePlayer(registry)
    const client = yield* HttpClient.HttpClient
    const request = yield* pipe(HttpClientRequest.post('/api/tts'), HttpClientRequest.bodyJson({ text, voice }))
    const response = yield* client.execute(request)

    yield* response.status >= 400
      ? Effect.gen(function* () {
          const msg = yield* response.text
          return yield* Effect.fail(new TtsError({ message: msg }))
        })
      : pipe(
          response.stream,
          Stream.mapEffect((chunk) =>
            Effect.sync(() => {
              player.playChunk(chunk)
              pipe(
                registry.get(loading),
                (isLoading) =>
                  isLoading &&
                  (() => {
                    registry.set(loading, false)
                    registry.set(playing, true)
                  })()
              )
            })
          ),
          Stream.runDrain,
          Effect.andThen(Effect.sync(() => player.finish(() => registry.set(playing, false))))
        )
  }).pipe(Effect.catchAll((err) => Effect.sync(() => setError(registry, String(err)))))

const consumeTts = (registry: Registry.Registry, text: string, voice: TtsVoice) => {
  const prev = registry.get(fiberRef)
  const fiber = clientRuntime.runFork(
    pipe(
      prev ? Fiber.interrupt(prev) : Effect.void,
      Effect.andThen(
        Effect.sync(() => {
          resetAll(registry)
          registry.set(loading, true)
          registry.set(error, '')
        })
      ),
      Effect.andThen(streamEffect(registry, text, voice))
    )
  )
  registry.set(fiberRef, fiber)
}

// --- Public API ---

export const warmup = (registry: Registry.Registry) =>
  Effect.sync(() => {
    void pipe(
      ensurePlayer(registry),
      Effect.catchAll(() => Effect.void),
      Effect.runPromise
    )
  })

export const speak = (registry: Registry.Registry, text: string, voice: TtsVoice) =>
  Effect.sync(() => (registry.get(muted) ? undefined : consumeTts(registry, text, voice)))

export const toggleMute = (registry: Registry.Registry) =>
  Effect.sync(() => {
    registry.set(muted, !registry.get(muted))
    const fiber = registry.get(fiberRef)
    registry.set(fiberRef, undefined)
    resetAll(registry)
    pipe(
      Option.fromNullable(fiber),
      Option.match({
        onNone: () => {},
        onSome: (f) => Effect.runFork(Fiber.interrupt(f))
      })
    )
  })

export const destroy = (registry: Registry.Registry) =>
  Effect.sync(() => {
    const fiber = registry.get(fiberRef)
    registry.set(fiberRef, undefined)
    resetAll(registry)
    void registry.get(playerRef)?.context.close()
    registry.set(playerRef, undefined)
    registry.set(error, '')
    pipe(
      Option.fromNullable(fiber),
      Option.match({
        onNone: () => {},
        onSome: (f) => Effect.runFork(Fiber.interrupt(f))
      })
    )
  })
