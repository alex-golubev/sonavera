import { Effect, Layer, Stream } from 'effect'
import { TtsRpc } from '../rpc'
import { OpenAiTts, OpenAiTtsLive } from './openai'

const TtsHandlers = TtsRpc.toLayer(
  Effect.gen(function* () {
    const tts = yield* OpenAiTts
    return {
      Tts: ({ text, voice }) => tts.speakStream(text, voice).pipe(Stream.map((chunk) => ({ audio: chunk })))
    }
  })
)

export const TtsLive = TtsHandlers.pipe(Layer.provide(OpenAiTtsLive))
