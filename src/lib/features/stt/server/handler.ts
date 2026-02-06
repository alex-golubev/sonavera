import { HttpApiBuilder, HttpServerResponse } from '@effect/platform'
import { Effect, Layer, Stream, pipe } from 'effect'
import { SttApi } from '../api'
import { OpenAiStt, OpenAiSttLive } from './openai'

const encoder = new TextEncoder()

const SttHandlers = HttpApiBuilder.group(SttApi, 'stt', (handlers) =>
  handlers.handle('transcribe', ({ payload, urlParams }) =>
    Effect.gen(function* () {
      const stt = yield* OpenAiStt
      return HttpServerResponse.stream(
        pipe(
          stt.transcribeStream(payload, urlParams.language),
          Stream.map((delta) => encoder.encode(delta))
        ),
        { contentType: 'text/plain; charset=utf-8' }
      )
    })
  )
)

export const SttLive = pipe(SttHandlers, Layer.provide(OpenAiSttLive))
