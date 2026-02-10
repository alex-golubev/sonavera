import { HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Layer } from 'effect'
import { RootRpc } from '$lib/rpc/rpc'

// RPC
const RpcServerLayer = Layer.mergeAll(RpcSerialization.layerMsgPack, HttpServer.layerContext)
export const { handler: rpcHandler } = RpcServer.toWebHandler(RootRpc, { layer: RpcServerLayer })
