import { FetchHttpClient } from '@effect/platform'
import { RpcClient, RpcSerialization } from '@effect/rpc'
import { Layer } from 'effect'

export const ProtocolLive = RpcClient.layerProtocolHttp({ url: '/api/rpc' }).pipe(
  Layer.provide(RpcSerialization.layerMsgPack),
  Layer.provide(FetchHttpClient.layer)
)
