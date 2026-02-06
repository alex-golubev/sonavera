import { HttpApiSchema } from '@effect/platform'
import { Schema } from 'effect'

export class TranscribeError extends Schema.TaggedError<TranscribeError>()(
  'TranscribeError',
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

export const TranscribePayload = HttpApiSchema.Uint8Array({
  contentType: 'application/octet-stream'
})

export const TranscribeUrlParams = Schema.Struct({
  language: Schema.optionalWith(Schema.String, { default: () => 'en' })
})
