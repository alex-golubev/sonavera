import { HttpApiBuilder, HttpServerResponse } from '@effect/platform'
import { Effect, Layer, pipe } from 'effect'
import { TtsApi } from '../api'
import { OpenAiTts, OpenAiTtsLive } from './openai'

const TtsHandlers = HttpApiBuilder.group(TtsApi, 'tts', (handlers) =>
  handlers.handle('speak', ({ payload }) =>
    Effect.gen(function* () {
      const tts = yield* OpenAiTts
      return HttpServerResponse.stream(tts.speakStream(payload.text, payload.voice), {
        contentType: 'application/octet-stream'
      })
    })
  )
)

export const TtsLive = pipe(TtsHandlers, Layer.provide(OpenAiTtsLive))
