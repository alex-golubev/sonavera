import { FetchHttpClient } from '@effect/platform'
import { RpcClient, RpcSerialization } from '@effect/rpc'
import { AtomRpc } from '@effect-atom/atom'
import { Layer } from 'effect'
import { AppRpcGroup } from './group'

const ProtocolLive = RpcClient.layerProtocolHttp({ url: '/api/rpc' }).pipe(
  Layer.provide([RpcSerialization.layerNdjson, FetchHttpClient.layer])
)

export class AppRpc extends AtomRpc.Tag<AppRpc>()('AppRpc', {
  group: AppRpcGroup,
  protocol: ProtocolLive
}) {}
