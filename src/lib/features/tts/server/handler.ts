import { Effect } from 'effect'
import { OpenAiTts } from './openai'
import type { TtsVoice } from '../schema'

export { OpenAiTtsLive } from './openai'

export const speak = (text: string, voice: TtsVoice) =>
  Effect.gen(function* () {
    const tts = yield* OpenAiTts
    return tts.speakStream(text, voice)
  })
