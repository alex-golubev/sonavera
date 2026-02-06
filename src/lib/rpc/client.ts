import { AtomRpc } from '@effect-atom/atom'
import { RootRpc } from './rpc'
import { ProtocolLive } from './protocol'

export class AppClient extends AtomRpc.Tag<AppClient>()('AppClient', {
  group: RootRpc,
  protocol: ProtocolLive
}) {}
