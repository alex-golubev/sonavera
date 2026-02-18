import { RpcClient } from '@effect/rpc'
import { type Registry } from '$lib/client/effect-atom'
import { ProtocolLive } from '$lib/client/protocol'
import { clientRuntime } from '$lib/client/runtime'
import { replaceState } from '$app/navigation'
import { resolve } from '$app/paths'
import { Effect, Fiber, Match, Option, Stream, pipe } from 'effect'
import {
  conversationId,
  corrections,
  error,
  fiberRef,
  listening,
  messages,
  muted,
  pendingCorrections,
  persistFailed,
  phase,
  playerRef,
  speaking,
  streamingText,
  transcription,
  vadReady,
  vadRef
} from './atoms'
import { createPlayer, pcmConfig } from './pcm-player'
import { ConversationRpc } from '../rpc'
import { ConversationAudioInput, type ConversationStreamEvent, type CorrectionItem } from '../schema'
import { createVad, toggleVad } from './vad'

// --- PCM player helpers ---

const ensurePlayer = (registry: Registry.Registry) =>
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

const stopPlayer = (registry: Registry.Registry) => {
  registry.get(playerRef)?.stop()
  registry.set(phase, 'idle')
}

// --- Event processing ---

const processEvent = (registry: Registry.Registry) => (event: ConversationStreamEvent) =>
  pipe(
    Match.value(event),
    Match.tag('ConversationTranscription', (e) =>
      Effect.sync(() => {
        registry.set(transcription, e.text)
        registry.set(messages, [...registry.get(messages), { role: 'user' as const, content: e.text }])
        registry.set(phase, 'responding')
      })
    ),
    Match.tag('ConversationLlmChunk', (e) =>
      Effect.sync(() => {
        registry.set(streamingText, registry.get(streamingText) + e.text)
        registry.set(phase, 'responding')
      })
    ),
    Match.tag('ConversationLlmDone', (e) =>
      Effect.sync(() => {
        registry.set(messages, [...registry.get(messages), { role: 'assistant' as const, content: e.text }])
        registry.set(streamingText, '')
      })
    ),
    Match.tag('ConversationCorrections', (e) =>
      Effect.sync(() => {
        const userMsgIndex = registry.get(messages).length - 1
        const current = registry.get(pendingCorrections)
        registry.set(pendingCorrections, new Map([...current, [userMsgIndex, e.corrections]]))
      })
    ),
    Match.tag('ConversationAudioChunk', (e) =>
      Effect.sync(() => {
        const player = registry.get(playerRef)
        player?.playChunk(e.data)
        registry.set(phase, 'speaking')
      })
    ),
    Match.tag('ConversationDone', () =>
      Effect.sync(() => {
        const player = registry.get(playerRef)
        pipe(
          Option.fromNullable(player),
          Option.match({
            onNone: () => registry.set(phase, 'idle'),
            onSome: (p) => p.finish(() => registry.set(phase, 'idle'))
          })
        )
      })
    ),
    Match.tag('ConversationStarted', (e) =>
      Effect.sync(() => {
        registry.set(conversationId, e.conversationId)
        replaceState(resolve(`/chat/${e.conversationId}`), {})
      })
    ),
    Match.tag('ConversationPersisted', (e) =>
      Effect.sync(() => {
        registry.set(conversationId, e.conversationId)
        registry.set(persistFailed, false)

        // Replace messages with DB-persisted versions (with IDs)
        registry.set(
          messages,
          e.messages.map((m) => ({ id: m.id, role: m.role, content: m.content }))
        )

        // Build messageId-keyed corrections map from DB data
        const correctionsByMessageId = new Map<string, ReadonlyArray<CorrectionItem>>()
        e.corrections.forEach((c) => {
          const existing = correctionsByMessageId.get(c.messageId) ?? []
          correctionsByMessageId.set(c.messageId, [
            ...existing,
            { category: c.category, original: c.original, correction: c.correction, explanation: c.explanation }
          ])
        })
        registry.set(corrections, correctionsByMessageId)
        registry.set(pendingCorrections, new Map())

        replaceState(resolve(`/chat/${e.conversationId}`), {})
      })
    ),
    Match.tag('ConversationPersistFailed', () =>
      Effect.sync(() => {
        registry.set(persistFailed, true)
      })
    ),
    Match.exhaustive
  )

// --- Pipeline ---

const runPipeline = (registry: Registry.Registry, input: ConversationAudioInput) =>
  Effect.gen(function* () {
    const client = yield* RpcClient.make(ConversationRpc)
    const isMuted = registry.get(muted)

    const stream = client.conversationStream({
      messages: [...registry.get(messages)],
      input,
      tts: !isMuted,
      conversationId: registry.get(conversationId)
    })

    yield* !isMuted
      ? pipe(
          ensurePlayer(registry),
          Effect.andThen(() => pipe(stream, Stream.runForEach(processEvent(registry))))
        )
      : pipe(stream, Stream.runForEach(processEvent(registry)))
  }).pipe(
    Effect.provide(ProtocolLive),
    Effect.scoped,
    Effect.catchAll((err) =>
      Effect.sync(() => {
        registry.set(phase, 'idle')
        registry.set(streamingText, '')
        registry.set(error, String(err))
      })
    )
  )

const startPipeline = (registry: Registry.Registry, input: ConversationAudioInput) => {
  const prev = registry.get(fiberRef)
  const fiber = clientRuntime.runFork(
    pipe(
      prev ? Fiber.interrupt(prev) : Effect.void,
      Effect.andThen(
        Effect.sync(() => {
          stopPlayer(registry)
          registry.set(streamingText, '')
          registry.set(transcription, '')
          registry.set(error, '')
          registry.set(persistFailed, false)
          registry.set(phase, 'transcribing')
        })
      ),
      Effect.andThen(runPipeline(registry, input))
    )
  )
  registry.set(fiberRef, fiber)
}

// --- Public API ---

export const sendAudio = (registry: Registry.Registry, audio: Uint8Array) =>
  startPipeline(registry, new ConversationAudioInput({ data: audio }))

export const toggle = (registry: Registry.Registry) => {
  clientRuntime.runFork(
    Effect.gen(function* () {
      const mic = registry.get(vadRef)
      yield* mic ? toggleVad(registry, mic) : createVad(registry)
    }).pipe(Effect.catchAll((err) => Effect.sync(() => registry.set(error, String(err)))))
  )
}

export const warmup = (registry: Registry.Registry) => {
  void pipe(
    ensurePlayer(registry),
    Effect.catchAll(() => Effect.void),
    Effect.runPromise
  )
}

export const toggleMute = (registry: Registry.Registry) =>
  Effect.sync(() => {
    registry.set(muted, !registry.get(muted))
    const fiber = registry.get(fiberRef)
    stopPlayer(registry)
    pipe(
      Option.fromNullable(fiber),
      Option.match({
        onNone: () => {},
        onSome: (f) => {
          registry.set(fiberRef, undefined)
          Effect.runFork(Fiber.interrupt(f))
        }
      })
    )
  })

export const destroy = (registry: Registry.Registry) =>
  Effect.sync(() => {
    // Interrupt active pipeline
    const fiber = registry.get(fiberRef)
    registry.set(fiberRef, undefined)
    pipe(
      Option.fromNullable(fiber),
      Option.match({
        onNone: () => {},
        onSome: (f) => Effect.runFork(Fiber.interrupt(f))
      })
    )

    // Destroy VAD
    const mic = registry.get(vadRef)
    mic?.destroy()
    registry.set(vadRef, undefined)
    registry.set(vadReady, false)
    registry.set(listening, false)
    registry.set(speaking, false)

    // Destroy player
    stopPlayer(registry)
    void registry.get(playerRef)?.context.close()
    registry.set(playerRef, undefined)

    // Reset state
    registry.set(conversationId, undefined)
    registry.set(persistFailed, false)
    registry.set(corrections, new Map())
    registry.set(pendingCorrections, new Map())
    registry.set(messages, [])
    registry.set(streamingText, '')
    registry.set(transcription, '')
    registry.set(error, '')
    registry.set(phase, 'idle')
  })

export const hydrate = (
  registry: Registry.Registry,
  data: {
    readonly conversationId: string
    readonly messages: ReadonlyArray<{ readonly id: string; readonly role: string; readonly content: string }>
    readonly corrections: ReadonlyArray<{
      readonly messageId: string
      readonly category: string
      readonly original: string
      readonly correction: string
      readonly explanation: string
    }>
  }
) => {
  registry.set(conversationId, data.conversationId)
  registry.set(
    messages,
    data.messages.map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content }))
  )

  const correctionsByMessageId = new Map<string, ReadonlyArray<CorrectionItem>>()
  data.corrections.forEach((c) => {
    const existing = correctionsByMessageId.get(c.messageId) ?? []
    correctionsByMessageId.set(c.messageId, [
      ...existing,
      {
        category: c.category as CorrectionItem['category'],
        original: c.original,
        correction: c.correction,
        explanation: c.explanation
      }
    ])
  })
  registry.set(corrections, correctionsByMessageId)
}

// Re-export atoms for UI consumption
export {
  conversationId,
  corrections,
  error,
  initializing,
  listening,
  messages,
  muted,
  pendingCorrections,
  persistFailed,
  phase,
  speaking,
  streamingText,
  transcription,
  vadReady
} from './atoms'
