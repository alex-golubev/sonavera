import { HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Layer } from 'effect'
import { LessonHandlersLayer } from '~/features/lesson/handlers'
import { AppRpcGroup } from './group'

const { handler } = RpcServer.toWebHandler(AppRpcGroup, {
  layer: Layer.mergeAll(LessonHandlersLayer, RpcSerialization.layerNdjson, HttpServer.layerContext)
})

export { handler }
