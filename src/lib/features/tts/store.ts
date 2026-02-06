import { Atom, Result, type Registry } from '$lib/effect-atom'
import { Effect, Match, pipe } from 'effect'
import { AppClient } from '$lib/rpc/client'
import { type PCMPlayer, createPlayer, pcmConfig } from './pcm-player'
import type { TtsVoice } from './schema'

// --- State atoms ---

export const playing = Atom.make(false)
export const loading = Atom.make(false)
export const error = Atom.make('')
export const muted = Atom.make(false)

// --- Internal refs ---

const disposeStreamRef = Atom.keepAlive(Atom.make<(() => void) | undefined>(undefined))
const playerRef = Atom.keepAlive(Atom.make<PCMPlayer | undefined>(undefined))

// --- Helpers ---

const resetStream = (registry: Registry.Registry) => {
  registry.get(disposeStreamRef)?.()
  registry.set(disposeStreamRef, undefined)
}

const stopPlayer = (registry: Registry.Registry) => {
  registry.get(playerRef)?.stop()
  registry.set(playing, false)
}

const resetAll = (registry: Registry.Registry) => {
  resetStream(registry)
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

const consumeTts = (registry: Registry.Registry, text: string, voice: TtsVoice) => {
  resetAll(registry)
  registry.set(loading, true)
  registry.set(error, '')

  let consumedCount = 0
  let isFirstChunk = true

  void pipe(
    ensurePlayer(registry),
    Effect.andThen((player) =>
      Effect.sync(() => {
        const atom = AppClient.query('Tts', { text, voice })
        const unmount = registry.mount(atom)

        const markPlaying = () => {
          isFirstChunk = false
          registry.set(loading, false)
          registry.set(playing, true)
        }

        const onStreamEnd = () => {
          player.finish(() => registry.set(playing, false))
          resetStream(registry)
        }

        const unsubscribe = registry.subscribe(atom, () =>
          pipe(
            registry.get(atom),
            Result.matchWithWaiting({
              onWaiting: () => {},
              onSuccess: ({ value: { items, done } }) => {
                const newItems = items.slice(consumedCount)
                consumedCount = items.length
                newItems.forEach((c) => player.playChunk(c.audio))
                pipe(isFirstChunk && newItems.length > 0, (shouldMark) => shouldMark && markPlaying())
                pipe(done, (d) => (d ? onStreamEnd() : registry.set(atom, undefined)))
              },
              onError: (err) =>
                pipe(
                  Match.value(err),
                  Match.tag('NoSuchElementException', () => onStreamEnd()),
                  Match.orElse((e) => setError(registry, String(e)))
                ),
              onDefect: () => setError(registry, 'Unknown error')
            })
          )
        )

        registry.set(disposeStreamRef, () => {
          unsubscribe()
          unmount()
        })
      })
    ),
    Effect.catchAll((err) => Effect.sync(() => setError(registry, String(err)))),
    Effect.runPromise
  )
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
    resetAll(registry)
  })

export const destroy = (registry: Registry.Registry) =>
  Effect.sync(() => {
    resetAll(registry)
    void registry.get(playerRef)?.context.close()
    registry.set(playerRef, undefined)
    registry.set(error, '')
  })
