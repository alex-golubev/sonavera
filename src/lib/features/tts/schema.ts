import { HttpApiSchema } from '@effect/platform'
import { Schema } from 'effect'

export class TtsError extends Schema.TaggedError<TtsError>()(
  'TtsError',
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

export const TtsVoice = Schema.Literal('coral')
export type TtsVoice = typeof TtsVoice.Type

export const TtsPayload = Schema.Struct({
  text: Schema.String,
  voice: TtsVoice
})
