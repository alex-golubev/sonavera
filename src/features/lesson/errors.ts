import { Data, Schema } from 'effect'

export class LessonError extends Schema.TaggedError<LessonError>()('LessonError', {
  message: Schema.String
}) {}

export class LiveKitTokenError extends Data.TaggedError('LiveKitTokenError')<{
  readonly message: string
}> {}

export class SessionStartError extends Data.TaggedError('SessionStartError')<{
  readonly cause: unknown
}> {}
