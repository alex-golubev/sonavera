import { FetchHttpClient } from '@effect/platform'
import { RpcClient, RpcSerialization } from '@effect/rpc'
import { AtomRpc } from '@effect-atom/atom'
import { Layer } from 'effect'
import { LessonGroup } from '~/features/lesson/schema'

export const protocol = RpcClient.layerProtocolHttp({ url: '/api/rpc' }).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provideMerge(RpcSerialization.layerNdjson)
)

export class AppClient extends AtomRpc.Tag<AppClient>()('AppClient', {
  group: LessonGroup,
  protocol
}) {}
