import { RpcGroup } from '@effect/rpc'
import { LlmRpc } from '$lib/features/llm/rpc'
import { SttRpc } from '$lib/features/stt/rpc'

export class RootRpc extends RpcGroup.make().merge(SttRpc).merge(LlmRpc) {}
