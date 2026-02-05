import { pipe } from 'effect'

export const PCM_SAMPLE_RATE = 24000

const BYTES_PER_SAMPLE = 2
const PRE_BUFFER_BYTES = Math.floor((PCM_SAMPLE_RATE * 300) / 1000) * BYTES_PER_SAMPLE
const LOOKAHEAD_SEC = 0.005

// --- Pure utility functions ---

const concatBytes = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const out = new Uint8Array(a.length + b.length)
  out.set(a)
  out.set(b, a.length)
  return out
}

const alignToSampleBoundary = (bytes: Uint8Array): [aligned: Uint8Array, remainder: Uint8Array] => {
  const aligned = bytes.length - (bytes.length % BYTES_PER_SAMPLE)
  return [bytes.slice(0, aligned), bytes.slice(aligned)]
}

const pcmToFloat32 = (pcm: Uint8Array): Float32Array => {
  const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength)
  return Float32Array.from(
    { length: pcm.length / BYTES_PER_SAMPLE },
    (_, i) => view.getInt16(i * BYTES_PER_SAMPLE, true) / 32768
  )
}

// --- Player ---

export type PCMPlayer = {
  readonly playChunk: (pcmBytes: Uint8Array) => void
  readonly finish: (onDrained: () => void) => void
  readonly stop: () => void
  readonly context: AudioContext
}

export const createPlayer = (ctx: AudioContext): PCMPlayer => {
  let nextPlayTime = 0
  let pendingBytes: Uint8Array = new Uint8Array(0)
  let preBuffer: Uint8Array = new Uint8Array(0)
  let isBuffering = true
  let finished = false
  let drainCallback: (() => void) | undefined
  const activeSources = new Set<AudioBufferSourceNode>()

  const checkDrained = (): void => {
    pipe(finished && activeSources.size === 0, (ready) => ready && drainCallback?.())
  }

  const scheduleAudio = (floatData: Float32Array): void => {
    const buffer = ctx.createBuffer(1, floatData.length, PCM_SAMPLE_RATE)
    buffer.getChannelData(0).set(floatData)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    const startTime = Math.max(ctx.currentTime + LOOKAHEAD_SEC, nextPlayTime)
    source.start(startTime)
    activeSources.add(source)
    source.onended = () => {
      activeSources.delete(source)
      checkDrained()
    }
    nextPlayTime = startTime + buffer.duration
  }

  const processBytes = (bytes: Uint8Array): void => {
    const [aligned, remainder] = alignToSampleBoundary(concatBytes(pendingBytes, bytes))
    pendingBytes = remainder
    pipe(aligned.length > 0, (hasData) => hasData && scheduleAudio(pcmToFloat32(aligned)))
  }

  const flushPreBuffer = (): void => {
    const buffered = preBuffer
    preBuffer = new Uint8Array(0)
    isBuffering = false
    processBytes(buffered)
  }

  const handleBuffering = (bytes: Uint8Array): void => {
    preBuffer = concatBytes(preBuffer, bytes)
    pipe(preBuffer.length >= PRE_BUFFER_BYTES, (ready) => ready && flushPreBuffer())
  }

  const reset = (): void => {
    activeSources.forEach((s) => {
      s.stop()
      s.disconnect()
    })
    activeSources.clear()
    nextPlayTime = 0
    pendingBytes = new Uint8Array(0)
    preBuffer = new Uint8Array(0)
    isBuffering = true
    finished = false
    drainCallback = undefined
  }

  return {
    playChunk: (pcmBytes) => (isBuffering ? handleBuffering(pcmBytes) : processBytes(pcmBytes)),
    finish: (onDrained) => {
      finished = true
      drainCallback = onDrained
      checkDrained()
    },
    stop: reset,
    context: ctx
  }
}
