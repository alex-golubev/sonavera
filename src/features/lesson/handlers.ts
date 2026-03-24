import { Effect } from 'effect'
import { LessonGroup } from '~/features/lesson/schema'
import { LiveKitService } from '~/services/LiveKit'

export const LessonHandlersLive = LessonGroup.toLayer({
  StartLesson: (payload) =>
    Effect.gen(function* () {
      const livekit = yield* LiveKitService
      const { token } = yield* livekit.createLessonRoom(payload.lessonId, payload.userName, {
        'lesson.language': 'English',
        'lesson.nativeLanguage': 'Russian'
      })
      return { token, serverUrl: livekit.serverUrl }
    })
})
