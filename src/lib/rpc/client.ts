import { FetchHttpClient } from '@effect/platform'
import { AtomRpc } from '@effect-atom/atom'
import { RpcClient, RpcSerialization } from '@effect/rpc'
import { Layer } from 'effect'
import { AppRpc } from './rpc'

export class AppClient extends AtomRpc.Tag<AppClient>()('AppClient', {
  group: AppRpc,
  protocol: RpcClient.layerProtocolHttp({ url: '/api/rpc' }).pipe(
    Layer.provide(RpcSerialization.layerNdjson),
    Layer.provide(FetchHttpClient.layer)
  )
}) {}
