import { Schema } from 'effect'

export class LlmError extends Schema.TaggedError<LlmError>()('LlmError', {
  message: Schema.String
}) {}

export const LlmRole = Schema.Literal('user', 'assistant')

export const LlmMessage = Schema.Struct({
  role: LlmRole,
  content: Schema.String
})

export type LlmMessage = typeof LlmMessage.Type
export type LlmRole = typeof LlmRole.Type

export const LlmChunk = Schema.Struct({ text: Schema.String })
