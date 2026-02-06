import { HttpApiSchema } from '@effect/platform'
import { Schema } from 'effect'
import { Language } from '$lib/features/language/schema'
import { Level } from '$lib/features/level/schema'

export class LlmError extends Schema.TaggedError<LlmError>()(
  'LlmError',
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

export const LlmRole = Schema.Literal('user', 'assistant')

export const LlmMessage = Schema.Struct({
  role: LlmRole,
  content: Schema.String
})

export type LlmMessage = typeof LlmMessage.Type
export type LlmRole = typeof LlmRole.Type

export const LlmPayload = Schema.Struct({
  messages: Schema.Array(LlmMessage),
  language: Language,
  level: Level
})
