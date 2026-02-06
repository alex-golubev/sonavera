import { RpcGroup } from '@effect/rpc'
import { TtsRpc } from '$lib/features/tts/rpc'

export class RootRpc extends RpcGroup.make().merge(TtsRpc) {}
