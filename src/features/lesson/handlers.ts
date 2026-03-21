import { Effect } from 'effect'
import { LiveKitToken } from './ports'
import { ConnectionInfo, LessonError, LessonRpcGroup, PingResponse } from './rpc'

export const LessonHandlersLayer = LessonRpcGroup.toLayer(
  Effect.gen(function* () {
    const livekit = yield* LiveKitToken
    return {
      Ping: () => Effect.succeed(new PingResponse({ message: 'pong' })),
      GetConnectionInfo: ({ language }) =>
        Effect.gen(function* () {
          const roomName = `lesson-${crypto.randomUUID()}`
          const { url, token } = yield* livekit.generate({
            roomName,
            participantIdentity: `user-${crypto.randomUUID()}`,
            attributes: { 'lesson.language': language }
          })
          return new ConnectionInfo({ url, token, roomName })
        }).pipe(
          Effect.tapError((error) => Effect.logError('GetConnectionInfo failed', error)),
          Effect.mapError((error) => new LessonError({ message: error.message }))
        )
    }
  })
)
