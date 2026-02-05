import { Schema } from 'effect'

export class TtsError extends Schema.TaggedError<TtsError>()('TtsError', {
  message: Schema.String
}) {}

export const TtsChunk = Schema.Struct({ audio: Schema.Uint8ArrayFromBase64 })
