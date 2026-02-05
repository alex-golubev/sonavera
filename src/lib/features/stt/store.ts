import { Atom, Result, type Registry } from '$lib/effect-atom'
import { MicVAD, utils } from '@ricky0123/vad-web'
import { Effect, Match, pipe } from 'effect'
import { AppClient } from '$lib/rpc/client'

// --- State atoms ---

export const listening = Atom.make(false)
export const speaking = Atom.make(false)
export const transcribing = Atom.make(false)
export const text = Atom.make('')
export const error = Atom.make('')
export const ready = Atom.make(false)
export const initializing = Atom.make(false)

// --- Internal ---

const transcribeQuery = (audio: Uint8Array, language: string) => AppClient.query('Transcribe', { audio, language })

const vadRef = Atom.make<MicVAD | undefined>(undefined)
const disposeStreamRef = Atom.make<(() => void) | undefined>(undefined)

const resetStream = (registry: Registry.Registry) => {
  registry.get(disposeStreamRef)?.()
  registry.set(disposeStreamRef, undefined)
}

const finishStream = (registry: Registry.Registry) => {
  registry.set(transcribing, false)
  resetStream(registry)
}

const consumeTranscription = (registry: Registry.Registry, audio: Uint8Array, language: string) => {
  resetStream(registry)
  registry.set(text, '')
  registry.set(transcribing, true)
  registry.set(error, '')

  const atom = transcribeQuery(audio, language)
  const unmount = registry.mount(atom)

  const pullOrFinish = (done: boolean) => (done ? finishStream(registry) : registry.set(atom, undefined))

  const unsubscribe = registry.subscribe(atom, () =>
    pipe(
      registry.get(atom),
      Result.matchWithWaiting({
        onWaiting: () => {},
        onSuccess: ({ value: { items, done } }) => {
          registry.set(text, items.map((c) => c.text).join(''))
          pullOrFinish(done)
        },
        onError: (err) => {
          pipe(
            Match.value(err),
            Match.tag('NoSuchElementException', () => {}),
            Match.orElse((e) => registry.set(error, String(e)))
          )
          registry.set(text, '')
          registry.set(transcribing, false)
          resetStream(registry)
        },
        onDefect: () => {
          registry.set(error, 'Unknown error')
          registry.set(text, '')
          registry.set(transcribing, false)
          resetStream(registry)
        }
      })
    )
  )

  registry.set(disposeStreamRef, () => {
    unsubscribe()
    unmount()
  })
}

// --- VAD operations ---

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

const toggleVad = (registry: Registry.Registry, mic: MicVAD) =>
  registry.get(listening) ? pauseVad(registry, mic) : startVad(registry, mic)

const createVad = (registry: Registry.Registry, language: string) =>
  Effect.suspend(() =>
    registry.get(vadRef) || registry.get(initializing)
      ? Effect.void
      : Effect.gen(function* () {
          registry.set(initializing, true)

          const mic = yield* Effect.tryPromise({
            try: () =>
              MicVAD.new({
                baseAssetPath: '/vad/',
                onnxWASMBasePath: '/vad/',
                onSpeechStart: () => registry.set(speaking, true),
                onSpeechEnd: (audio) => {
                  registry.set(speaking, false)
                  consumeTranscription(registry, new Uint8Array(utils.encodeWAV(audio)), language)
                },
                onVADMisfire: () => registry.set(speaking, false)
              }),
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
  )

// --- Public API ---

export const toggle = (registry: Registry.Registry, language: string) =>
  pipe(
    Effect.suspend(() => {
      const mic = registry.get(vadRef)
      return mic ? toggleVad(registry, mic) : createVad(registry, language)
    }),
    Effect.tapError((err) => Effect.sync(() => registry.set(error, String(err)))),
    Effect.ignore
  )

export const destroy = (registry: Registry.Registry) =>
  Effect.sync(() => {
    resetStream(registry)
    registry.get(vadRef)?.destroy()
    registry.set(vadRef, undefined)
    registry.set(listening, false)
    registry.set(speaking, false)
    registry.set(transcribing, false)
    registry.set(text, '')
    registry.set(error, '')
    registry.set(ready, false)
  })
