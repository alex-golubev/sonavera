import { Schema } from 'effect'

export class RoomCreationError extends Schema.TaggedError<RoomCreationError>()('RoomCreationError', {
  message: Schema.String
}) {}

export class TokenGenerationError extends Schema.TaggedError<TokenGenerationError>()('TokenGenerationError', {
  message: Schema.String
}) {}

export const LessonError = Schema.Union(RoomCreationError, TokenGenerationError)
export type LessonError = typeof LessonError.Type
