import { RpcGroup } from '@effect/rpc'
import { SttRpc } from '$lib/features/stt/rpc'

export class RootRpc extends RpcGroup.make().merge(SttRpc) {}
