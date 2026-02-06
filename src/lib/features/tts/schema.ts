import { Schema } from 'effect'

export class TtsError extends Schema.TaggedError<TtsError>()('TtsError', {
  message: Schema.String
}) {}

export const TtsVoice = Schema.Literal('coral')
export type TtsVoice = typeof TtsVoice.Type

export const TtsChunk = Schema.Struct({ audio: Schema.Uint8ArrayFromSelf })
