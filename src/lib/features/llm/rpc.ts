import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { LlmChunk, LlmError, LlmMessage } from './schema'

export class LlmRpc extends RpcGroup.make(
  Rpc.make('Llm', {
    payload: { messages: Schema.Array(LlmMessage) },
    success: LlmChunk,
    error: LlmError,
    stream: true
  })
) {}
