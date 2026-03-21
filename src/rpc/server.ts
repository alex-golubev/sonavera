import { HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Layer } from 'effect'
import { LiveKitTokenLive } from '~/features/lesson/adapters/LiveKitTokenAdapter'
import { LessonHandlersLayer } from '~/features/lesson/handlers'
import { AppRpcGroup } from './group'

const { handler } = RpcServer.toWebHandler(AppRpcGroup, {
  layer: Layer.mergeAll(
    LessonHandlersLayer.pipe(Layer.provide(LiveKitTokenLive)),
    RpcSerialization.layerNdjson,
    HttpServer.layerContext
  )
})

export { handler }
