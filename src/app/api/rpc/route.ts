import { HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Layer } from 'effect'
import { LessonHandlersLive } from '~/features/lesson/handlers'
import { LessonGroup } from '~/features/lesson/schema'
import { LiveKitLive } from '~/services/LiveKit'

const LessonLive = LessonHandlersLive.pipe(Layer.provide(LiveKitLive))

const AppLayer = Layer.mergeAll(LessonLive, RpcSerialization.layerNdjson, HttpServer.layerContext)

const { handler } = RpcServer.toWebHandler(LessonGroup, {
  layer: AppLayer
})

export const GET = (request: Request) => handler(request)
export const POST = (request: Request) => handler(request)
