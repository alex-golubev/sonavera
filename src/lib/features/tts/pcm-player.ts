import { pipe } from 'effect'

// --- Config (data) ---

type PCMConfig = {
  readonly sampleRate: number
  readonly bytesPerSample: number
  readonly preBufferMs: number
  readonly lookaheadSec: number
}

export const pcmConfig: PCMConfig = {
  sampleRate: 24000,
  bytesPerSample: 2,
  preBufferMs: 150,
  lookaheadSec: 0.005
}

// --- Derived computations ---

const preBufferBytes = (c: PCMConfig): number => Math.floor((c.sampleRate * c.preBufferMs) / 1000) * c.bytesPerSample

// --- Pure utility functions ---

const concatBytes = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const out = new Uint8Array(a.length + b.length)
  out.set(a)
  out.set(b, a.length)
  return out
}

const alignToSampleBoundary = (bytes: Uint8Array): [aligned: Uint8Array, remainder: Uint8Array] => {
  const aligned = bytes.length - (bytes.length % pcmConfig.bytesPerSample)
  return [bytes.slice(0, aligned), bytes.slice(aligned)]
}

const pcmToFloat32 = (pcm: Uint8Array): Float32Array => {
  const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength)
  return Float32Array.from(
    { length: pcm.length / pcmConfig.bytesPerSample },
    (_, i) => view.getInt16(i * pcmConfig.bytesPerSample, true) / 32768
  )
}

// --- Player state (data) ---

type PlayerState = {
  nextPlayTime: number
  pendingBytes: Uint8Array
  preBuffer: Uint8Array
  isBuffering: boolean
  finished: boolean
  drainCallback: (() => void) | undefined
  activeSources: Set<AudioBufferSourceNode>
}

const initialState = (): PlayerState => ({
  nextPlayTime: 0,
  pendingBytes: new Uint8Array(0),
  preBuffer: new Uint8Array(0),
  isBuffering: true,
  finished: false,
  drainCallback: undefined,
  activeSources: new Set()
})

// --- Player ---

export type PCMPlayer = {
  readonly playChunk: (pcmBytes: Uint8Array) => void
  readonly finish: (onDrained: () => void) => void
  readonly stop: () => void
  readonly context: AudioContext
}

export const createPlayer = (ctx: AudioContext): PCMPlayer => {
  let state = initialState()

  const checkDrained = (): void => {
    pipe(state.finished && state.activeSources.size === 0, (ready) => ready && state.drainCallback?.())
  }

  const scheduleAudio = (floatData: Float32Array): void => {
    const buffer = ctx.createBuffer(1, floatData.length, pcmConfig.sampleRate)
    buffer.getChannelData(0).set(floatData)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    const startTime = Math.max(ctx.currentTime + pcmConfig.lookaheadSec, state.nextPlayTime)
    source.start(startTime)
    state.activeSources.add(source)
    source.onended = () => {
      state.activeSources.delete(source)
      checkDrained()
    }
    state.nextPlayTime = startTime + buffer.duration
  }

  const processBytes = (bytes: Uint8Array): void => {
    const [aligned, remainder] = alignToSampleBoundary(concatBytes(state.pendingBytes, bytes))
    state.pendingBytes = remainder
    pipe(aligned.length > 0, (hasData) => hasData && scheduleAudio(pcmToFloat32(aligned)))
  }

  const flushPreBuffer = (): void => {
    const buffered = state.preBuffer
    state.preBuffer = new Uint8Array(0)
    state.isBuffering = false
    processBytes(buffered)
  }

  const handleBuffering = (bytes: Uint8Array): void => {
    state.preBuffer = concatBytes(state.preBuffer, bytes)
    pipe(state.preBuffer.length >= preBufferBytes(pcmConfig), (ready) => ready && flushPreBuffer())
  }

  const reset = (): void => {
    state.activeSources.forEach((s) => {
      s.stop()
      s.disconnect()
    })
    state = initialState()
  }

  return {
    playChunk: (pcmBytes) => (state.isBuffering ? handleBuffering(pcmBytes) : processBytes(pcmBytes)),
    finish: (onDrained) => {
      pipe(state.isBuffering, (buffering) => buffering && flushPreBuffer())
      state.finished = true
      state.drainCallback = onDrained
      checkDrained()
    },
    stop: reset,
    context: ctx
  }
}
