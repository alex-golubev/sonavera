import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { LessonError } from '~/features/lesson/errors'

export const StartLesson = Rpc.make('StartLesson', {
  payload: {
    lessonId: Schema.NonEmptyString.pipe(Schema.maxLength(128)),
    userName: Schema.NonEmptyString.pipe(Schema.maxLength(64))
  },
  success: Schema.Struct({
    token: Schema.String,
    serverUrl: Schema.String
  }),
  error: LessonError
})

export class LessonGroup extends RpcGroup.make(StartLesson) {}
