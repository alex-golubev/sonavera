import { Effect, Layer, Stream } from 'effect'
import { SttRpc } from '../rpc'
import { OpenAiStt, OpenAiSttLive } from './openai'

const SttHandlers = SttRpc.toLayer(
  Effect.gen(function* () {
    const stt = yield* OpenAiStt
    return {
      Transcribe: ({ audio, language }) =>
        stt.transcribeStream(audio, language).pipe(Stream.map((delta) => ({ text: delta })))
    }
  })
)

export const SttLive = SttHandlers.pipe(Layer.provide(OpenAiSttLive))
