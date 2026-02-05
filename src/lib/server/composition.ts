import { HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Layer } from 'effect'
import { LlmLive } from '$lib/features/llm/server/handler'
import { SttLive } from '$lib/features/stt/server/handler'
import { RootRpc } from '$lib/rpc/rpc'

const HandlersLive = Layer.mergeAll(SttLive, LlmLive)

const ServerLayer = Layer.mergeAll(HandlersLive, RpcSerialization.layerNdjson, HttpServer.layerContext)

export const { handler } = RpcServer.toWebHandler(RootRpc, { layer: ServerLayer })
