import type { Registry } from '$lib/effect-atom'
import { MicVAD, utils } from '@ricky0123/vad-web'
import { Effect, pipe } from 'effect'
import { error, initializing, listening, ready, speaking, vadRef } from './atoms'
import { consumeTranscription } from './transcribe'

// Suppress noisy VAD internal logs (https://github.com/ricky0123/vad/issues/253)
const withSilencedVadLogs = <A>(fn: () => A): A => {
  const orig = console.log
  console.log = (...args: unknown[]) =>
    typeof args[0] === 'string' && args[0].startsWith('VAD |') ? undefined : orig.apply(console, args)
  const result = fn()
  const restore = () => { console.log = orig }
  const sync = () => { restore(); return result }
  return result instanceof Promise ? result.finally(restore) as A : sync()
}

const pauseVad = (registry: Registry.Registry, mic: MicVAD) =>
  pipe(
    Effect.tryPromise({ try: () => mic.pause(), catch: String }),
    Effect.andThen(Effect.sync(() => registry.set(listening, false)))
  )

const startVad = (registry: Registry.Registry, mic: MicVAD) =>
  pipe(
    Effect.tryPromise({ try: () => mic.start(), catch: String }),
    Effect.andThen(
      Effect.sync(() => {
        registry.set(listening, true)
        registry.set(error, '')
      })
    )
  )

const initVad = (registry: Registry.Registry, language: string) =>
  Effect.gen(function* () {
    registry.set(initializing, true)

    const mic = yield* Effect.tryPromise({
      try: () =>
        withSilencedVadLogs(() =>
          MicVAD.new({
            baseAssetPath: '/vad/',
            onnxWASMBasePath: '/vad/',
            onSpeechStart: () => registry.set(speaking, true),
            onSpeechEnd: (audio) => {
              registry.set(speaking, false)
              consumeTranscription(registry, new Uint8Array(utils.encodeWAV(audio)), language)
            },
            onVADMisfire: () => registry.set(speaking, false)
          })
        ),
      catch: String
    })

    registry.set(vadRef, mic)
    registry.set(ready, true)

    yield* Effect.tryPromise({ try: () => mic.start(), catch: String })
    registry.set(listening, true)
  }).pipe(
    Effect.tapError((err) => Effect.sync(() => registry.set(error, err))),
    Effect.ensuring(Effect.sync(() => registry.set(initializing, false))),
    Effect.ignore
  )

export const toggleVad = (registry: Registry.Registry, mic: MicVAD) =>
  registry.get(listening) ? pauseVad(registry, mic) : startVad(registry, mic)

export const createVad = (registry: Registry.Registry, language: string) =>
  Effect.suspend(() => (registry.get(vadRef) || registry.get(initializing) ? Effect.void : initVad(registry, language)))
