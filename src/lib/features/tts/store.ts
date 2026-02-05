import { Atom, Result, type Registry } from '$lib/effect-atom'
import { Effect, Match, pipe } from 'effect'
import { AppClient } from '$lib/rpc/client'

// --- State atoms ---

export const playing = Atom.make(false)
export const loading = Atom.make(false)
export const error = Atom.make('')
export const muted = Atom.make(false)

// --- Internal refs ---

const audioChunksRef = Atom.keepAlive(Atom.make<ReadonlyArray<Uint8Array>>([]))
const disposeStreamRef = Atom.keepAlive(Atom.make<(() => void) | undefined>(undefined))
const blobUrlRef = Atom.keepAlive(Atom.make<string | undefined>(undefined))
const audioElRef = Atom.keepAlive(Atom.make<HTMLAudioElement | undefined>(undefined))

// --- Helpers ---

const ttsQuery = (text: string, voice: string) => AppClient.query('Tts', { text, voice })

const maybeRevokeUrl = (url: string | undefined) => (url ? URL.revokeObjectURL(url) : undefined)

const concatChunks = (chunks: ReadonlyArray<Uint8Array>): Uint8Array => {
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0)
  const merged = new Uint8Array(totalLength)
  chunks.reduce((offset, chunk) => {
    merged.set(chunk, offset)
    return offset + chunk.length
  }, 0)
  return merged
}

const resetStream = (registry: Registry.Registry) => {
  registry.get(disposeStreamRef)?.()
  registry.set(disposeStreamRef, undefined)
}

const stopAudio = (registry: Registry.Registry) => {
  registry.get(audioElRef)?.pause()
  registry.set(audioElRef, undefined)
  registry.set(playing, false)
  maybeRevokeUrl(registry.get(blobUrlRef))
  registry.set(blobUrlRef, undefined)
}

const playAudio = (registry: Registry.Registry) => {
  stopAudio(registry)

  const chunks = registry.get(audioChunksRef)
  const merged = concatChunks(chunks)
  const blob = new Blob([merged as BlobPart], { type: 'audio/mpeg' })
  const url = URL.createObjectURL(blob)
  registry.set(blobUrlRef, url)

  const audio = new Audio(url)
  registry.set(audioElRef, audio)

  audio.addEventListener('ended', () => {
    registry.set(playing, false)
    maybeRevokeUrl(registry.get(blobUrlRef))
    registry.set(blobUrlRef, undefined)
    registry.set(audioElRef, undefined)
  })

  registry.set(loading, false)
  registry.set(playing, true)
  audio.play().catch((err) => {
    registry.set(error, String(err))
    registry.set(playing, false)
  })
}

const consumeTts = (registry: Registry.Registry, text: string, voice: string) => {
  resetStream(registry)
  stopAudio(registry)
  registry.set(audioChunksRef, [])
  registry.set(loading, true)
  registry.set(error, '')

  const atom = ttsQuery(text, voice)
  const unmount = registry.mount(atom)

  const finishStream = () => {
    resetStream(registry)
    playAudio(registry)
  }

  const pullOrFinish = (done: boolean) => (done ? finishStream() : registry.set(atom, undefined))

  const unsubscribe = registry.subscribe(atom, () =>
    pipe(
      registry.get(atom),
      Result.matchWithWaiting({
        onWaiting: () => {},
        onSuccess: ({ value: { items, done } }) => {
          registry.set(
            audioChunksRef,
            items.map((c) => c.audio)
          )
          pullOrFinish(done)
        },
        onError: (err) => {
          pipe(
            Match.value(err),
            Match.tag('NoSuchElementException', () => {}),
            Match.orElse((e) => registry.set(error, String(e)))
          )
          registry.set(loading, false)
          resetStream(registry)
        },
        onDefect: () => {
          registry.set(error, 'Unknown error')
          registry.set(loading, false)
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

// --- Public API ---

export const speak = (registry: Registry.Registry, text: string, voice: string) =>
  Effect.sync(() => (registry.get(muted) ? undefined : consumeTts(registry, text, voice)))

export const stop = (registry: Registry.Registry) =>
  Effect.sync(() => {
    resetStream(registry)
    stopAudio(registry)
    registry.set(loading, false)
  })

export const toggleMute = (registry: Registry.Registry) =>
  Effect.sync(() => {
    registry.set(muted, !registry.get(muted))
    resetStream(registry)
    stopAudio(registry)
    registry.set(loading, false)
  })

export const destroy = (registry: Registry.Registry) =>
  Effect.sync(() => {
    resetStream(registry)
    stopAudio(registry)
    registry.set(loading, false)
    registry.set(error, '')
    registry.set(audioChunksRef, [])
  })
