import { Effect } from 'effect'
import { LessonRpcGroup, PingResponse } from './rpc'

export const LessonHandlersLayer = LessonRpcGroup.toLayer({
  Ping: () => Effect.succeed(new PingResponse({ message: 'pong' }))
})
