import { Effect, Stream, pipe } from 'effect'
import { UserSettings } from '$lib/server/user-settings'
import { OpenAiStt } from './openai'

export { OpenAiSttLive } from './openai'

const encoder = new TextEncoder()

export const transcribe = (payload: Uint8Array) =>
  Effect.gen(function* () {
    const settings = yield* UserSettings
    const stt = yield* OpenAiStt
    return pipe(
      stt.transcribeStream(payload, settings.targetLanguage),
      Stream.map((delta) => encoder.encode(delta))
    )
  })
