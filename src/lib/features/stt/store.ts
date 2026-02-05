import { Atom, Result, type Registry } from '$lib/effect-atom'
import { MicVAD, utils } from '@ricky0123/vad-web'
import { Effect, Option, pipe } from 'effect'
import { AppClient } from '$lib/rpc/client'

// --- State ---

export const listening = Atom.make(false)
export const speaking = Atom.make(false)
export const transcribing = Atom.make(false)
export const text = Atom.make('')
export const error = Atom.make('')
export const initializing = Atom.make(false)

const vadRef = Atom.make<MicVAD | null>(null)

// --- Transcription ---

const transcribeQuery = (audio: Uint8Array, language: string) =>
  AppClient.query('Transcribe', { audio, language })

const handleTranscriptionResult = (registry: Registry.Registry, r: Atom.PullResult<{ text: string }, unknown>) =>
  Result.matchWithError(r, {
    onInitial: () => {},
    onSuccess: (s) => {
      registry.set(text, s.value.items.map((c) => c.text).join(''))
      if (s.value.done) registry.set(transcribing, false)
    },
    onError: (err) => {
      registry.set(error, String(err))
      registry.set(transcribing, false)
    },
    onDefect: () => {
      registry.set(transcribing, false)
    }
  })

const startTranscription = (registry: Registry.Registry, raw: Float32Array, language: string) => {
  const atom = transcribeQuery(new Uint8Array(utils.encodeWAV(raw)), language)
  registry.set(text, '')
  registry.set(transcribing, true)
  registry.set(error, '')
  registry.mount(atom)
  registry.subscribe(atom, () => handleTranscriptionResult(registry, registry.get(atom)))
}

// --- VAD ---

const vadConfig = (registry: Registry.Registry, language: string) => ({
  baseAssetPath: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.30/dist/',
  onnxWASMBasePath: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/',
  onSpeechStart: () => registry.set(speaking, true),
  onSpeechEnd: (audio: Float32Array) => {
    registry.set(speaking, false)
    startTranscription(registry, audio, language)
  },
  onVADMisfire: () => registry.set(speaking, false)
})

const initVad = (registry: Registry.Registry, language: string) =>
  Effect.gen(function* () {
    registry.set(initializing, true)
    const mic = yield* Effect.tryPromise(() => MicVAD.new(vadConfig(registry, language)))
    registry.set(vadRef, mic)
    yield* Effect.tryPromise(() => mic.start())
    registry.set(listening, true)
  }).pipe(
    Effect.catchAll((err) => Effect.sync(() => registry.set(error, String(err)))),
    Effect.ensuring(Effect.sync(() => registry.set(initializing, false)))
  )

// --- Actions ---

const pauseVad = (registry: Registry.Registry, mic: MicVAD) =>
  Effect.gen(function* () {
    yield* Effect.tryPromise(() => mic.pause())
    registry.set(listening, false)
  })

const startVad = (registry: Registry.Registry, mic: MicVAD) =>
  Effect.gen(function* () {
    yield* Effect.tryPromise(() => mic.start())
    registry.set(listening, true)
    registry.set(error, '')
  })

export const toggle = (registry: Registry.Registry, language: string) =>
  pipe(
    Option.fromNullable(registry.get(vadRef)),
    Option.match({
      onNone: () => initVad(registry, language),
      onSome: (mic) =>
        registry.get(listening) ? pauseVad(registry, mic) : startVad(registry, mic)
    }),
    Effect.ignore
  )

export const destroy = (registry: Registry.Registry) =>
  Effect.sync(() => {
    registry.get(vadRef)?.destroy()
    registry.set(vadRef, null)
    registry.set(listening, false)
    registry.set(speaking, false)
  })
