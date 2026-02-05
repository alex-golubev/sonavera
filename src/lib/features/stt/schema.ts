import { Schema } from 'effect'

export class TranscribeError extends Schema.TaggedError<TranscribeError>()('TranscribeError', {
  message: Schema.String
}) {}

export const TranscribeChunk = Schema.Struct({ text: Schema.String })
