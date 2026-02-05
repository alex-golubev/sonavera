import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as Registry from '@effect-atom/atom/Registry'
import * as Atom from '@effect-atom/atom/Atom'
import * as Result from '@effect-atom/atom/Result'
import { Cause, Effect } from 'effect'
import { NoSuchElementException } from 'effect/Cause'
import { TranscribeError } from './schema'

// --- Mock state ---

type VadCallbacks = {
  onSpeechStart: () => void
  onSpeechEnd: (audio: Float32Array) => void
  onVADMisfire: () => void
}

let vadCallbacks: VadCallbacks
let mockMic: { start: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }
let transcribeAtom: Atom.Writable<
  Result.Result<{ done: boolean; items: Array<{ text: string }> }, TranscribeError>,
  unknown
>

// --- Mocks ---

vi.mock('@ricky0123/vad-web', () => ({
  MicVAD: {
    new: vi.fn(async (opts: VadCallbacks & Record<string, unknown>) => {
      vadCallbacks = {
        onSpeechStart: opts.onSpeechStart as () => void,
        onSpeechEnd: opts.onSpeechEnd as (audio: Float32Array) => void,
        onVADMisfire: opts.onVADMisfire as () => void
      }
      mockMic = {
        start: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn()
      }
      return mockMic
    })
  },
  utils: {
    encodeWAV: vi.fn((audio: Float32Array) => audio.buffer)
  }
}))

vi.mock('$lib/rpc/client', () => ({
  AppClient: {
    query: vi.fn(() => {
      transcribeAtom = Atom.make(Result.initial(true)) as typeof transcribeAtom
      return transcribeAtom
    })
  }
}))

// --- Helpers ---

import * as stt from './store'

let registry: Registry.Registry

beforeEach(() => {
  registry = Registry.make({ scheduleTask: () => {} })
})

afterEach(() => {
  Effect.runSync(stt.destroy(registry))
  vi.clearAllMocks()
})

// --- Tests ---

describe('stt store', () => {
  describe('default state', () => {
    it('has correct initial values', () => {
      expect(registry.get(stt.listening)).toBe(false)
      expect(registry.get(stt.speaking)).toBe(false)
      expect(registry.get(stt.transcribing)).toBe(false)
      expect(registry.get(stt.text)).toBe('')
      expect(registry.get(stt.error)).toBe('')
      expect(registry.get(stt.ready)).toBe(false)
      expect(registry.get(stt.initializing)).toBe(false)
    })
  })

  describe('toggle → create VAD', () => {
    it('sets ready and listening after creation', async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))

      expect(registry.get(stt.ready)).toBe(true)
      expect(registry.get(stt.listening)).toBe(true)
      expect(registry.get(stt.initializing)).toBe(false)
    })

    it('calls MicVAD.new with correct paths', async () => {
      const { MicVAD } = await import('@ricky0123/vad-web')
      await Effect.runPromise(stt.toggle(registry, 'en'))

      expect(MicVAD.new).toHaveBeenCalledWith(
        expect.objectContaining({
          baseAssetPath: '/vad/',
          onnxWASMBasePath: '/vad/'
        })
      )
    })

    it('calls mic.start after creation', async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
      expect(mockMic.start).toHaveBeenCalled()
    })
  })

  describe('toggle → guard when initializing', () => {
    it('does nothing if already initializing', async () => {
      registry.set(stt.initializing, true)
      const { MicVAD } = await import('@ricky0123/vad-web')

      await Effect.runPromise(stt.toggle(registry, 'en'))

      expect(MicVAD.new).not.toHaveBeenCalled()
    })
  })

  describe('toggle → pause/start', () => {
    it('pauses when listening', async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
      expect(registry.get(stt.listening)).toBe(true)

      await Effect.runPromise(stt.toggle(registry, 'en'))
      expect(registry.get(stt.listening)).toBe(false)
      expect(mockMic.pause).toHaveBeenCalled()
    })

    it('starts when paused', async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
      await Effect.runPromise(stt.toggle(registry, 'en')) // pause
      mockMic.start.mockClear()

      await Effect.runPromise(stt.toggle(registry, 'en')) // start again
      expect(registry.get(stt.listening)).toBe(true)
      expect(mockMic.start).toHaveBeenCalled()
    })

    it('clears error on start', async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
      registry.set(stt.error, 'some error')

      await Effect.runPromise(stt.toggle(registry, 'en')) // pause
      await Effect.runPromise(stt.toggle(registry, 'en')) // start

      expect(registry.get(stt.error)).toBe('')
    })
  })

  describe('toggle → VAD creation error', () => {
    it('sets error and resets initializing', async () => {
      const { MicVAD } = await import('@ricky0123/vad-web')
      vi.mocked(MicVAD.new).mockRejectedValueOnce(new Error('No mic access'))

      await Effect.runPromise(stt.toggle(registry, 'en'))

      expect(registry.get(stt.error)).toBe('Error: No mic access')
      expect(registry.get(stt.initializing)).toBe(false)
      expect(registry.get(stt.ready)).toBe(false)
    })
  })

  describe('VAD callbacks', () => {
    beforeEach(async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
    })

    it('onSpeechStart sets speaking true', () => {
      vadCallbacks.onSpeechStart()
      expect(registry.get(stt.speaking)).toBe(true)
    })

    it('onVADMisfire sets speaking false', () => {
      vadCallbacks.onSpeechStart()
      vadCallbacks.onVADMisfire()
      expect(registry.get(stt.speaking)).toBe(false)
    })

    it('onSpeechEnd sets speaking false and starts transcription', () => {
      vadCallbacks.onSpeechStart()
      vadCallbacks.onSpeechEnd(new Float32Array([1, 2, 3]))

      expect(registry.get(stt.speaking)).toBe(false)
      expect(registry.get(stt.transcribing)).toBe(true)
      expect(registry.get(stt.text)).toBe('')
      expect(registry.get(stt.error)).toBe('')
    })
  })

  describe('transcription — success', () => {
    beforeEach(async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
      vadCallbacks.onSpeechEnd(new Float32Array([1, 2, 3]))
    })

    it('updates text and finishes on done chunk', () => {
      registry.set(transcribeAtom, Result.success({ done: true, items: [{ text: 'Hello world' }] }))

      expect(registry.get(stt.text)).toBe('Hello world')
      expect(registry.get(stt.transcribing)).toBe(false)
    })
  })

  describe('transcription — error', () => {
    beforeEach(async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
      vadCallbacks.onSpeechEnd(new Float32Array([1, 2, 3]))
    })

    it('sets error on TranscribeError', () => {
      registry.set(transcribeAtom, Result.fail(new TranscribeError({ message: 'API failed' })))

      expect(registry.get(stt.error)).toContain('API failed')
      expect(registry.get(stt.text)).toBe('')
      expect(registry.get(stt.transcribing)).toBe(false)
    })

    it('ignores NoSuchElementException', () => {
      registry.set(transcribeAtom, Result.fail(new NoSuchElementException()))

      expect(registry.get(stt.error)).toBe('')
      expect(registry.get(stt.transcribing)).toBe(false)
    })

    it('handles defect', () => {
      registry.set(transcribeAtom, Result.failure(Cause.die('boom')))

      expect(registry.get(stt.error)).toBe('Unknown error')
      expect(registry.get(stt.text)).toBe('')
      expect(registry.get(stt.transcribing)).toBe(false)
    })
  })

  describe('destroy', () => {
    it('resets all atoms', async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
      Effect.runSync(stt.destroy(registry))

      expect(registry.get(stt.listening)).toBe(false)
      expect(registry.get(stt.speaking)).toBe(false)
      expect(registry.get(stt.transcribing)).toBe(false)
      expect(registry.get(stt.ready)).toBe(false)
    })

    it('calls vad.destroy()', async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
      Effect.runSync(stt.destroy(registry))

      expect(mockMic.destroy).toHaveBeenCalled()
    })

    it('cleans up active transcription stream', async () => {
      await Effect.runPromise(stt.toggle(registry, 'en'))
      vadCallbacks.onSpeechEnd(new Float32Array([1, 2, 3]))
      expect(registry.get(stt.transcribing)).toBe(true)

      Effect.runSync(stt.destroy(registry))
      expect(registry.get(stt.transcribing)).toBe(false)
    })
  })
})
