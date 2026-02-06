import { RpcGroup } from '@effect/rpc'
import { LlmRpc } from '$lib/features/llm/rpc'
import { TtsRpc } from '$lib/features/tts/rpc'

export class RootRpc extends RpcGroup.make().merge(LlmRpc).merge(TtsRpc) {}
