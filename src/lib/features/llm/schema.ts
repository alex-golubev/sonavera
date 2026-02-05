import { Schema } from 'effect'

export class LlmError extends Schema.TaggedError<LlmError>()('LlmError', {
  message: Schema.String
}) {}

export const LlmMessage = Schema.Struct({
  role: Schema.String,
  content: Schema.String
})

export type LlmMessage = typeof LlmMessage.Type

export const LlmChunk = Schema.Struct({ text: Schema.String })
