import { HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Effect, Layer } from 'effect'
import { AppRpc } from '../rpc/rpc'

const HandlersLive = AppRpc.toLayer({
  Ping: () => Effect.succeed({ ok: true })
})

const ServerLayer = Layer.mergeAll(HandlersLive, RpcSerialization.layerNdjson, HttpServer.layerContext)

export const { handler } = RpcServer.toWebHandler(AppRpc, { layer: ServerLayer })
